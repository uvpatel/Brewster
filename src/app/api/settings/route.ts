import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/index";
import { stores } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function GET() {
  try {
    const user = await requirePermission("settings:manage");
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, user.storeId))
      .limit(1);

    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requirePermission("settings:manage");
    const body = await request.json();

    const [updated] = await db
      .update(stores)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        receiptPrefix: body.receiptPrefix,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, user.storeId))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
