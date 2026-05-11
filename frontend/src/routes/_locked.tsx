import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { hasPin, isUnlocked } from "@/lib/pin";
import { useAutoLock } from "@/hooks/use-auto-lock";

export const Route = createFileRoute("/_locked")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    if (!(await hasPin())) throw redirect({ to: "/setup" });
    if (!isUnlocked()) throw redirect({ to: "/unlock" });
  },
  component: LockedLayout,
});

function LockedLayout() {
  useAutoLock();
  return <Outlet />;
}
