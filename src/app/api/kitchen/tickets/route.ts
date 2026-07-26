import { NextResponse } from "next/server";
import { db } from "@/index";
import { kitchenTickets, kitchenTicketItems } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function POST(request: Request) {
  try {
    const user = await requirePermission("kitchen:update");
    const body = await request.json();

    const result = await db.transaction(async (tx) => {
      const [newTicket] = await tx
        .insert(kitchenTickets)
        .values({
          orderId: body.orderId || `ord-${Date.now()}`,
          ticketNumber: body.ticketNumber,
          sequenceNumber: 1,
          status: "TO_COOK",
          sentBy: user.employeeId,
          sentAt: new Date(),
        })
        .returning();

      if (body.items && body.items.length > 0) {
        await tx.insert(kitchenTicketItems).values(
          body.items.map((item: any) => ({
            kitchenTicketId: newTicket.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            status: "PENDING",
          })),
        );
      }

      return newTicket;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
