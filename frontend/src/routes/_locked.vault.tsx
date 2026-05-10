import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_locked/vault")({
  component: () => <Outlet />,
});
