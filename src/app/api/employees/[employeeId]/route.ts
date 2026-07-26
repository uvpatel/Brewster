import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/index";
import { accounts } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";
import { AuthorizationError } from "@/lib/auth/authorization-error";
import { logAuditEvent } from "@/lib/auth/audit-log";

const updateEmployeeSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const { employeeId } = await params;
    const currentUser = await requirePermission("employees:manage");
    const body = await request.json();

    const validation = updateEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { isActive, status } = validation.data;
    const shouldDeactivate = isActive === false || status === "ARCHIVED";

    // Rule: Users cannot deactivate themselves
    if (currentUser.employeeId === employeeId && shouldDeactivate) {
      logAuditEvent({
        action: "UNAUTHORIZED_ATTEMPT",
        actorId: currentUser.employeeId,
        storeId: currentUser.storeId,
        targetId: employeeId,
        details: { reason: "Self-deactivation prohibited" },
      });
      return NextResponse.json(
        { success: false, message: "You cannot deactivate your own account" },
        { status: 403 },
      );
    }

    const updatedEmployee = await db.transaction(async (tx) => {
      const [targetAccount] = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, employeeId));

      if (!targetAccount) {
        throw new AuthorizationError("Target employee not found", 403);
      }

      // Rule: Same store check
      if (targetAccount.storeId !== currentUser.storeId) {
        throw new AuthorizationError("Access denied for store mismatch", 403);
      }

      // Rule: MANAGER cannot modify an ADMIN
      if (currentUser.role === "MANAGER" && targetAccount.role === "ADMIN") {
        throw new AuthorizationError("Managers cannot modify Administrator accounts", 403);
      }

      // Rule: Prevent deactivation of the final active ADMIN
      if (targetAccount.role === "ADMIN" && shouldDeactivate) {
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
            "Cannot deactivate the final active Administrator in the store",
            403,
          );
        }
      }

      const newStatus = shouldDeactivate ? "ARCHIVED" : "ACTIVE";
      const newIsActive = !shouldDeactivate;

      const [updated] = await tx
        .update(accounts)
        .set({
          status: newStatus,
          isActive: newIsActive,
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
      action: shouldDeactivate ? "EMPLOYEE_DEACTIVATION" : "EMPLOYEE_ACTIVATION",
      actorId: currentUser.employeeId,
      storeId: currentUser.storeId,
      targetId: employeeId,
    });

    return NextResponse.json({
      success: true,
      message: shouldDeactivate ? "Employee deactivated successfully" : "Employee activated successfully",
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
