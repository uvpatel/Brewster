import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/index";
import { customers } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("customers:manage");
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(customers)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone,
        notes: body.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, id), eq(customers.storeId, user.storeId)))
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
    const user = await requirePermission("customers:manage");
    const { id } = await params;

    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.storeId, user.storeId)));

    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
