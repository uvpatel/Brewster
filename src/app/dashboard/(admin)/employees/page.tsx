import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { requirePermission } from "@/lib/auth/require-permission";

export default async function EmployeesPage() {
  try {
    const user = await requirePermission("employees:manage");

    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Employees Management</h1>
        <p className="mt-2 text-muted-foreground">
          Role: {user.role} | Store ID: {user.storeId}
        </p>
      </main>
    );
  } catch (error) {
    redirect("/unauthorized");
  }
}