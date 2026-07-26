import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Access Denied
        </h1>

        <p className="mb-8 text-muted-foreground">
          You do not have permission to view this page or perform this action.
          If you believe this is an error, please contact your administrator or manager.
        </p>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button  variant="default">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>

          <Button  variant="outline">
            <Link href="/sign-in">
              <LogOut className="mr-2 h-4 w-4" />
              Sign in with another account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
