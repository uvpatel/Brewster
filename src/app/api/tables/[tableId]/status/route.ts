import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/index";
import { restaurantTables } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tableId: string }> },
) {
  try {
    await requirePermission("tables:view");
    const { tableId } = await params;
    const { status } = await request.json();

    const [updated] = await db
      .update(restaurantTables)
      .set({ status })
      .where(eq(restaurantTables.id, tableId))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
