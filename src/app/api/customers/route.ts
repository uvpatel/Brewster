import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/index";
import { customers } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function GET() {
  try {
    const user = await requirePermission("customers:view");
    const list = await db
      .select()
      .from(customers)
      .where(eq(customers.storeId, user.storeId));

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
    const user = await requirePermission("customers:manage");
    const body = await request.json();

    const [created] = await db
      .insert(customers)
      .values({
        storeId: user.storeId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        notes: body.notes,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
