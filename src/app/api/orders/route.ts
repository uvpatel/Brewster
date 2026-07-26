import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/index";
import { orders, orderItems, restaurantTables, posSessions } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function GET() {
  try {
    const user = await requirePermission("orders:view");
    const storeOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.storeId, user.storeId))
      .orderBy(desc(orders.createdAt))
      .limit(50);

    return NextResponse.json({ success: true, data: storeOrders });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("pos:use");
    const body = await request.json();

    const result = await db.transaction(async (tx) => {
      // 1. Resolve or create active POS session
      let [activeSession] = await tx
        .select()
        .from(posSessions)
        .where(and(eq(posSessions.storeId, user.storeId), eq(posSessions.status, "OPEN")))
        .limit(1);

      if (!activeSession) {
        const sessionCount = (await tx.select().from(posSessions).where(eq(posSessions.storeId, user.storeId))).length;
        [activeSession] = await tx
          .insert(posSessions)
          .values({
            storeId: user.storeId,
            openedBy: user.employeeId,
            sessionNumber: `SESSION-${sessionCount + 1}`,
            openingCash: "1000.00",
            status: "OPEN",
          })
          .returning();
      }

      // 2. Insert order record
      const [newOrder] = await tx
        .insert(orders)
        .values({
          storeId: user.storeId,
          sessionId: activeSession.id,
          orderNumber: body.orderNumber,
          tableId: body.tableId || null,
          customerId: body.customerId || null,
          employeeId: user.employeeId,
          orderType: body.type || "DINE_IN",
          status: body.status || "PAID",
          subtotal: body.subtotalAmount ? body.subtotalAmount.toString() : "0.00",
          taxAmount: body.taxAmount ? body.taxAmount.toString() : "0.00",
          discountAmount: body.discountAmount ? body.discountAmount.toString() : "0.00",
          totalAmount: body.payableAmount ? body.payableAmount.toString() : "0.00",
          paidAmount: body.paidAmount ? body.paidAmount.toString() : "0.00",
        })
        .returning();

      // 3. Insert line items
      if (body.items && body.items.length > 0) {
        await tx.insert(orderItems).values(
          body.items.map((item: any) => ({
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice ? item.unitPrice.toString() : "0",
            lineTotal: item.lineTotal ? item.lineTotal.toString() : "0",
            discountAmount: item.discountAmount ? item.discountAmount.toString() : "0",
            status: "SERVED",
          })),
        );
      }

      // 4. Update table status if applicable
      if (body.tableId && body.status === "PAID") {
        await tx
          .update(restaurantTables)
          .set({ status: "AVAILABLE" })
          .where(eq(restaurantTables.id, body.tableId));
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("Order Create Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
