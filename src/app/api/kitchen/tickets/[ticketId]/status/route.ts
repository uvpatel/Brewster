import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/index";
import { kitchenTickets, orders } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;
    const user = await requirePermission("kitchen:update");
    const body = await request.json();
    const { status } = body;

    const [existingTicket] = await db
      .select({ id: kitchenTickets.id })
      .from(kitchenTickets)
      .innerJoin(orders, eq(kitchenTickets.orderId, orders.id))
      .where(
        and(
          eq(kitchenTickets.id, ticketId),
          eq(orders.storeId, user.storeId),
        ),
      );

    if (!existingTicket) {
      return NextResponse.json(
        { success: false, message: "Kitchen ticket not found or access denied" },
        { status: 404 },
      );
    }

    const [updatedTicket] = await db
      .update(kitchenTickets)
      .set({
        status,
      })
      .where(eq(kitchenTickets.id, ticketId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Kitchen ticket status updated successfully",
      data: updatedTicket,
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
