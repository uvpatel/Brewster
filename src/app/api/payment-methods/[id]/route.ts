import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/index";
import { paymentMethods } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("payments:create");
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(paymentMethods)
      .set({
        isEnabled: body.isEnabled !== undefined ? body.isEnabled : undefined,
        upiId: body.upiId !== undefined ? body.upiId : undefined,
      })
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.storeId, user.storeId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
