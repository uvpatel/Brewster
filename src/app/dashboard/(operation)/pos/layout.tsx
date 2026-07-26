import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hasPermission } from "@/lib/auth/permissions";

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.isActive || !hasPermission(user.role, "pos:use")) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
