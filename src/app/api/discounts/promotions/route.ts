import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/index";
import { promotions, promotionProducts } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function GET() {
  try {
    const user = await requirePermission("discounts:view");
    const list = await db
      .select()
      .from(promotions)
      .where(eq(promotions.storeId, user.storeId));

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("discounts:manage");
    const body = await request.json();

    const now = new Date();
    const nextYear = new Date(now.getTime() + 365 * 86400000);

    const [created] = await db
      .insert(promotions)
      .values({
        storeId: user.storeId,
        name: body.name,
        scope: body.scope,
        minimumQuantity: body.minimumQuantity ? body.minimumQuantity.toString() : undefined,
        minimumOrderAmount: body.minimumOrderAmount ? body.minimumOrderAmount.toString() : undefined,
        discountType: body.discountType,
        discountValue: body.discountValue.toString(),
        startsAt: now,
        endsAt: nextYear,
        isActive: true,
      })
      .returning();

    if (body.productId && created) {
      await db.insert(promotionProducts).values({
        promotionId: created.id,
        productId: body.productId,
      });
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
