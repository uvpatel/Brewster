import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hasPermission } from "@/lib/auth/permissions";

export default async function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isActive || (!hasPermission(user.role, "employees:view") && !hasPermission(user.role, "employees:manage"))) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
