import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/index";
import {
  categories,
  products,
  floors,
  restaurantTables,
  customers,
  paymentMethods,
  coupons,
  promotions,
  orders,
  orderItems,
  kitchenTickets,
  kitchenTicketItems,
} from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";
import { seedStoreDefaults } from "@/lib/db/seed-store";

export async function GET() {
  try {
    const user = await requirePermission("pos:use");
    const storeId = user.storeId;

    // Run auto-seeding if store has no categories yet
    await seedStoreDefaults(storeId);

    // 1. Fetch categories
    const dbCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.storeId, storeId));

    // 2. Fetch products with category names/colors
    const dbProducts = await db
      .select({
        id: products.id,
        storeId: products.storeId,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        name: products.name,
        description: products.description,
        price: products.price,
        unitOfMeasure: products.unitOfMeasure,
        isActive: products.isActive,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.storeId, storeId));

    // 3. Fetch floors & tables
    const dbFloors = await db
      .select()
      .from(floors)
      .where(eq(floors.storeId, storeId));

    const dbTables = await db
      .select({
        id: restaurantTables.id,
        floorId: restaurantTables.floorId,
        floorName: floors.name,
        tableNumber: restaurantTables.tableNumber,
        seatingCapacity: restaurantTables.seats,
        status: restaurantTables.status,
      })
      .from(restaurantTables)
      .leftJoin(floors, eq(restaurantTables.floorId, floors.id))
      .where(eq(floors.storeId, storeId));

    // 4. Fetch customers
    const dbCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.storeId, storeId));

    // 5. Fetch payment methods
    const dbPaymentMethods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.storeId, storeId));

    // 6. Fetch coupons & promotions
    const dbCoupons = await db
      .select()
      .from(coupons)
      .where(eq(coupons.storeId, storeId));

    const dbPromotions = await db
      .select()
      .from(promotions)
      .where(eq(promotions.storeId, storeId));

    // 7. Fetch recent orders & line items
    const dbOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        tableId: orders.tableId,
        tableName: restaurantTables.tableNumber,
        customerId: orders.customerId,
        customerName: customers.name,
        customerEmail: customers.email,
        type: orders.orderType,
        status: orders.status,
        subtotalAmount: orders.subtotal,
        taxAmount: orders.taxAmount,
        discountAmount: orders.discountAmount,
        payableAmount: orders.totalAmount,
        paidAmount: orders.paidAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(restaurantTables, eq(orders.tableId, restaurantTables.id))
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.storeId, storeId))
      .orderBy(desc(orders.createdAt))
      .limit(50);

    const formattedOrders = await Promise.all(
      dbOrders.map(async (ord) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, ord.id));

        return {
          ...ord,
          subtotalAmount: parseFloat(String(ord.subtotalAmount || 0)),
          taxAmount: parseFloat(String(ord.taxAmount || 0)),
          discountAmount: parseFloat(String(ord.discountAmount || 0)),
          payableAmount: parseFloat(String(ord.payableAmount || 0)),
          paidAmount: parseFloat(String(ord.paidAmount || 0)),
          createdAt: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            unitPrice: parseFloat(String(i.unitPrice)),
            quantity: i.quantity,
            unitOfMeasure: "PIECE",
            discountAmount: parseFloat(String(i.discountAmount || 0)),
            lineTotal: parseFloat(String(i.lineTotal)),
          })),
        };
      }),
    );

    // 8. Fetch kitchen tickets
    const dbKitchenTickets = await db
      .select({
        id: kitchenTickets.id,
        ticketNumber: kitchenTickets.ticketNumber,
        orderId: kitchenTickets.orderId,
        status: kitchenTickets.status,
        sentAt: kitchenTickets.sentAt,
      })
      .from(kitchenTickets)
      .orderBy(desc(kitchenTickets.sentAt))
      .limit(50);

    const formattedTickets = await Promise.all(
      dbKitchenTickets.map(async (kt) => {
        const items = await db
          .select()
          .from(kitchenTicketItems)
          .where(eq(kitchenTicketItems.kitchenTicketId, kt.id));

        return {
          ...kt,
          sentAt: kt.sentAt ? new Date(kt.sentAt).toISOString() : new Date().toISOString(),
          items: items.map((i) => ({
            id: i.id,
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            isCompleted: i.status === "COMPLETED",
          })),
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: {
        categories: dbCategories,
        products: dbProducts.map((p) => ({
          ...p,
          price: parseFloat(String(p.price)),
        })),
        floors: dbFloors,
        tables: dbTables,
        customers: dbCustomers,
        paymentMethods: dbPaymentMethods,
        coupons: dbCoupons.map((c) => ({
          ...c,
          discountValue: parseFloat(String(c.discountValue)),
          minimumOrderAmount: c.minimumOrderAmount ? parseFloat(String(c.minimumOrderAmount)) : undefined,
        })),
        promotions: dbPromotions.map((p) => ({
          ...p,
          discountValue: parseFloat(String(p.discountValue)),
          minimumOrderAmount: p.minimumOrderAmount ? parseFloat(String(p.minimumOrderAmount)) : undefined,
        })),
        orders: formattedOrders,
        kitchenTickets: formattedTickets,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    console.error("POS Init Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
