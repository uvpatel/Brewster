import { db } from "@/index";
import {
  categories,
  products,
  floors,
  restaurantTables,
  paymentMethods,
  coupons,
  promotions,
  promotionProducts,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function seedStoreDefaults(storeId: string) {
  // Check if categories already exist
  const existingCats = await db
    .select()
    .from(categories)
    .where(eq(categories.storeId, storeId));

  if (existingCats.length > 0) {
    return; // Already seeded
  }

  // 1. Seed Categories
  const seedCategoriesData = [
    { storeId, name: "Hot Coffee", color: "#f97316", status: "ACTIVE" as const },
    { storeId, name: "Cold Beverages", color: "#06b6d4", status: "ACTIVE" as const },
    { storeId, name: "Pastries & Bakery", color: "#eab308", status: "ACTIVE" as const },
    { storeId, name: "Sandwiches & Snacks", color: "#22c55e", status: "ACTIVE" as const },
    { storeId, name: "Desserts", color: "#ec4899", status: "ACTIVE" as const },
  ];

  const insertedCats = await db
    .insert(categories)
    .values(seedCategoriesData)
    .returning();

  const catMap = new Map(insertedCats.map((c) => [c.name, c.id]));

  // 2. Seed Products
  const hotCoffeeId = catMap.get("Hot Coffee")!;
  const coldBevId = catMap.get("Cold Beverages")!;
  const bakeryId = catMap.get("Pastries & Bakery")!;
  const snacksId = catMap.get("Sandwiches & Snacks")!;
  const dessertsId = catMap.get("Desserts")!;

  const seedProductsData = [
    {
      storeId,
      categoryId: hotCoffeeId,
      name: "Espresso Single",
      description: "Rich and bold dark roast single shot espresso",
      price: "120.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: hotCoffeeId,
      name: "Cappuccino",
      description: "Espresso topped with steamed milk and thick foam",
      price: "180.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: hotCoffeeId,
      name: "Caffè Latte",
      description: "Smooth espresso with generous velvety steamed milk",
      price: "190.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: coldBevId,
      name: "Iced Caramel Macchiato",
      description: "Cold milk, espresso, and rich vanilla caramel drizzle",
      price: "220.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: coldBevId,
      name: "Cold Brew Special",
      description: "Slow-steeped 18-hour cold brew over ice",
      price: "200.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: bakeryId,
      name: "Butter Croissant",
      description: "Flaky layered French butter croissant",
      price: "140.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: bakeryId,
      name: "Blueberry Muffin",
      description: "Freshly baked muffin bursting with real blueberries",
      price: "150.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: snacksId,
      name: "Paneer Tikka Panini",
      description: "Grilled sourdough panini with spiced paneer tikka",
      price: "240.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: snacksId,
      name: "Avocado Toast",
      description: "Artisanal bread with smashed avocado and chili flakes",
      price: "260.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
    {
      storeId,
      categoryId: dessertsId,
      name: "New York Cheesecake",
      description: "Classic creamy cheesecake with berry compote",
      price: "250.00",
      unitOfMeasure: "PIECE" as const,
      status: "ACTIVE" as const,
    },
  ];

  await db.insert(products).values(seedProductsData);

  // 3. Seed Floors & Tables
  const [floor1] = await db
    .insert(floors)
    .values({ storeId, name: "Main Hall", displayOrder: 1, isActive: true })
    .returning();

  const [floor2] = await db
    .insert(floors)
    .values({ storeId, name: "First Floor Balcony", displayOrder: 2, isActive: true })
    .returning();

  await db.insert(restaurantTables).values([
    { floorId: floor1.id, tableNumber: "T-01", seats: 2, status: "AVAILABLE", isActive: true },
    { floorId: floor1.id, tableNumber: "T-02", seats: 4, status: "AVAILABLE", isActive: true },
    { floorId: floor1.id, tableNumber: "T-03", seats: 4, status: "AVAILABLE", isActive: true },
    { floorId: floor1.id, tableNumber: "T-04", seats: 6, status: "AVAILABLE", isActive: true },
    { floorId: floor2.id, tableNumber: "B-01", seats: 2, status: "AVAILABLE", isActive: true },
    { floorId: floor2.id, tableNumber: "B-02", seats: 4, status: "AVAILABLE", isActive: true },
  ]);

  // 4. Seed Payment Methods
  await db.insert(paymentMethods).values([
    { storeId, name: "Cash", type: "CASH", isEnabled: true },
    { storeId, name: "Card / Digital", type: "CARD", isEnabled: true },
    { storeId, name: "UPI QR Code", type: "UPI", upiId: "caffinecafe@ybl", isEnabled: true },
  ]);

  // 5. Seed Coupons & Promotions
  const now = new Date();
  const nextYear = new Date(now.getTime() + 365 * 86400000);

  await db.insert(coupons).values([
    {
      storeId,
      code: "WELCOME10",
      discountType: "PERCENTAGE" as const,
      discountValue: "10.00",
      minimumOrderAmount: "0.00",
      startsAt: now,
      endsAt: nextYear,
      isActive: true,
    },
    {
      storeId,
      code: "FLAT50",
      discountType: "FIXED" as const,
      discountValue: "50.00",
      minimumOrderAmount: "300.00",
      startsAt: now,
      endsAt: nextYear,
      isActive: true,
    },
  ]);

  const [capProduct] = await db
    .select()
    .from(products)
    .where(eq(products.name, "Cappuccino"))
    .limit(1);

  const [prom1] = await db
    .insert(promotions)
    .values({
      storeId,
      name: "Buy 3 Cappuccino Get 15% Off",
      scope: "PRODUCT" as const,
      minimumQuantity: "3.00",
      discountType: "PERCENTAGE" as const,
      discountValue: "15.00",
      startsAt: now,
      endsAt: nextYear,
      isActive: true,
    })
    .returning();

  if (capProduct && prom1) {
    await db.insert(promotionProducts).values({
      promotionId: prom1.id,
      productId: capProduct.id,
    });
  }

  await db.insert(promotions).values({
    storeId,
    name: "Orders Above ₹600 Get ₹100 Off",
    scope: "ORDER" as const,
    minimumOrderAmount: "600.00",
    discountType: "FIXED" as const,
    discountValue: "100.00",
    startsAt: now,
    endsAt: nextYear,
    isActive: true,
  });
}
