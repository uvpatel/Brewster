import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hasPermission } from "@/lib/auth/permissions";

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isActive || !hasPermission(user.role, "kitchen:view")) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
