import { NextRequest, NextResponse } from "next/server";
import { db } from "@/index";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";

export async function GET() {
  try {
    await requirePermission("employees:manage");
    const users = await db.select().from(user);
    return NextResponse.json(
      {
        users,
        message: "Users fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("employees:manage");
    const { name, email } = await request.json();

    const newUser = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
      })
      .returning();

    return NextResponse.json(
      {
        user: newUser[0],
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requirePermission("employees:manage");
    const { id, name, email } = await request.json();

    const updatedUser = await db
      .update(user)
      .set({ name, email, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: updatedUser[0],
        message: "User updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requirePermission("employees:manage");
    const { id } = await request.json();

    const deletedUser = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: deletedUser[0],
        message: "User deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
