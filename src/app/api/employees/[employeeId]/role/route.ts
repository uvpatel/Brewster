import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/index";
import { accounts } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";
import { logAuditEvent } from "@/lib/auth/audit-log";
import type { AppRole } from "@/lib/auth/permissions";

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "KITCHEN"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const { employeeId } = await params;
    const currentUser = await requirePermission("employees:manage");
    const body = await request.json();

    const validation = updateRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role payload",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const newRole = validation.data.role;

    // Rule: Users cannot change their own role (self-promotion / self-demotion)
    if (currentUser.employeeId === employeeId) {
      logAuditEvent({
        action: "UNAUTHORIZED_ATTEMPT",
        actorId: currentUser.employeeId,
        storeId: currentUser.storeId,
        targetId: employeeId,
        details: { reason: "Self-role change prohibited" },
      });
      return NextResponse.json(
        { success: false, message: "You cannot modify your own role" },
        { status: 403 },
      );
    }

    // Rule: MANAGER cannot assign ADMIN role
    if (currentUser.role === "MANAGER" && newRole === "ADMIN") {
      logAuditEvent({
        action: "UNAUTHORIZED_ATTEMPT",
        actorId: currentUser.employeeId,
        storeId: currentUser.storeId,
        targetId: employeeId,
        details: { reason: "MANAGER cannot assign ADMIN role" },
      });
      return NextResponse.json(
        { success: false, message: "Managers cannot promote users to Admin" },
        { status: 403 },
      );
    }

    // Perform database transaction for role update check
    const updatedEmployee = await db.transaction(async (tx) => {
      const [targetAccount] = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, employeeId));

      if (!targetAccount) {
        throw new AuthorizationError("Target employee not found", 403);
      }

      // Rule: Employee and administrator must belong to the same store
      if (targetAccount.storeId !== currentUser.storeId) {
        throw new AuthorizationError("Access denied for store mismatch", 403);
      }

      // Rule: MANAGER cannot update an existing ADMIN
      if (currentUser.role === "MANAGER" && targetAccount.role === "ADMIN") {
        throw new AuthorizationError("Managers cannot modify Administrator accounts", 403);
      }

      // Rule: Prevent demotion of the final active ADMIN in a store
      if (targetAccount.role === "ADMIN" && newRole !== "ADMIN") {
        const adminCountResult = await tx
          .select({ count: count() })
          .from(accounts)
          .where(
            and(
              eq(accounts.storeId, currentUser.storeId),
              eq(accounts.role, "ADMIN"),
              eq(accounts.status, "ACTIVE"),
            ),
          );

        const activeAdmins = Number(adminCountResult[0]?.count ?? 0);
        if (activeAdmins <= 1) {
          throw new AuthorizationError(
            "Cannot demote the final active Administrator in the store",
            403,
          );
        }
      }

      const [updated] = await tx
        .update(accounts)
        .set({
          role: newRole as AppRole,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, employeeId))
        .returning({
          id: accounts.id,
          name: accounts.name,
          email: accounts.email,
          role: accounts.role,
          storeId: accounts.storeId,
          status: accounts.status,
          isActive: accounts.isActive,
          createdAt: accounts.createdAt,
          updatedAt: accounts.updatedAt,
        });

      return updated;
    });

    logAuditEvent({
      action: "ROLE_CHANGE",
      actorId: currentUser.employeeId,
      storeId: currentUser.storeId,
      targetId: employeeId,
      details: { newRole },
    });

    return NextResponse.json({
      success: true,
      message: "Employee role updated successfully",
      data: updatedEmployee,
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
