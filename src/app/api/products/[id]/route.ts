import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/index";
import { products } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("products:manage");
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(products)
      .set({
        name: body.name,
        categoryId: body.categoryId,
        price: body.price ? body.price.toString() : undefined,
        unitOfMeasure: body.unitOfMeasure,
        description: body.description,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, id), eq(products.storeId, user.storeId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("products:manage");
    const { id } = await params;

    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.storeId, user.storeId)));

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
