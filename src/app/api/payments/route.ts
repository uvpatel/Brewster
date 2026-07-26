import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/index";
import { payments, orders } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function GET() {
  try {
    const user = await requirePermission("payments:view");
    const storePayments = await db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        sessionId: payments.sessionId,
        paymentMethodId: payments.paymentMethodId,
        processedBy: payments.processedBy,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .where(eq(orders.storeId, user.storeId));

    return NextResponse.json({
      success: true,
      data: storePayments,
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
    const user = await requirePermission("payments:create");
    const body = await request.json();

    const [newPayment] = await db
      .insert(payments)
      .values({
        ...body,
        processedBy: user.employeeId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Payment processed successfully",
        data: newPayment,
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
