import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/index";
import { products } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function GET() {
  try {
    const user = await requirePermission("products:view");
    const storeProducts = await db
      .select()
      .from(products)
      .where(eq(products.storeId, user.storeId));

    return NextResponse.json({
      success: true,
      data: storeProducts,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("products:manage");
    const body = await request.json();

    // Enforce multi-tenant storeId from authenticated context
    const storeId = user.storeId;

    const [newProduct] = await db
      .insert(products)
      .values({
        ...body,
        storeId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: newProduct,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}