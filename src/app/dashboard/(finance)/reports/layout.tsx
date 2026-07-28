import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hasPermission } from "@/lib/auth/permissions";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isActive || !hasPermission(user.role, "reports:view")) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
