import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/types";

interface DashboardHeaderProps {
  user: SessionUser;
  onSignOut: () => void;
}

export function DashboardHeader({ user, onSignOut }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
        <span className="inline-block px-2 py-1 text-xs font-semibold uppercase rounded-full bg-secondary text-secondary-foreground">
          {user.plan} Plan
        </span>
      </div>
      <Button onClick={onSignOut} variant="destructive">
        Sign out
      </Button>
    </div>
  );
}
