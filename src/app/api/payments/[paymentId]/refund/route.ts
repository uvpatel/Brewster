import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/index";
import { payments, orders } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";
import { logAuditEvent } from "@/lib/auth/audit-log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  try {
    const { paymentId } = await params;
    const user = await requirePermission("payments:refund");

    logAuditEvent({
      action: "REFUND_ATTEMPT",
      actorId: user.employeeId,
      storeId: user.storeId,
      details: { paymentId },
    });

    const [existingPayment] = await db
      .select({ id: payments.id })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .where(
        and(
          eq(payments.id, paymentId),
          eq(orders.storeId, user.storeId),
        ),
      );

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, message: "Payment not found or access denied" },
        { status: 404 },
      );
    }

    const [updatedPayment] = await db
      .update(payments)
      .set({
        status: "REFUNDED",
      })
      .where(eq(payments.id, paymentId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      data: updatedPayment,
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
