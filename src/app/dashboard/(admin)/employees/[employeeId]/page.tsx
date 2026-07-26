import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/index";
import { accounts } from "@/db/schema";
import { requirePermission } from "@/lib/auth/require-permission";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const user = await requirePermission("employees:manage");
  const { employeeId } = await params;

  const [employee] = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      email: accounts.email,
      role: accounts.role,
      status: accounts.status,
      isActive: accounts.isActive,
      storeId: accounts.storeId,
      createdAt: accounts.createdAt,
    })
    .from(accounts)
    .where(
      and(
        eq(accounts.id, employeeId),
        eq(accounts.storeId, user.storeId),
      ),
    );

  if (!employee) {
    redirect("/dashboard/employees");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Employee Details</h1>
      <div className="mt-4 space-y-2">
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Role:</strong> {employee.role}</p>
        <p><strong>Status:</strong> {employee.status}</p>
      </div>
    </main>
  );
}