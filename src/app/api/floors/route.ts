import { NextResponse } from "next/server";
import { db } from "@/index";
import { floors } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function POST(request: Request) {
  try {
    const user = await requirePermission("tables:manage");
    const body = await request.json();

    const [created] = await db
      .insert(floors)
      .values({
        storeId: user.storeId,
        name: body.name,
        displayOrder: body.sequence || 1,
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
