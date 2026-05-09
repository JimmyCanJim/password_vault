import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/pinky/BottomNav";
import { ConnectWalletGate } from "@/components/pinky/ConnectWalletGate";
import { ThemeToggle } from "@/components/pinky/ThemeToggle";
import { usePinky } from "@/lib/pinky-store";
import pinkyLogo from "@/assets/pinky-logo.png";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-sm rounded-3xl p-8 text-center">
        <h1 className="text-6xl font-bold text-gradient-pinky">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pact not found</p>
        <Link to="/" className="gradient-pinky mt-5 inline-block rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground">Home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-sm rounded-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="gradient-pinky mt-5 rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Pinky Pacts — On-Chain Accountability" },
      { name: "description", content: "Stake SOL or USDC on your habits. Pinky promise, sealed on Solana." },
      { name: "theme-color", content: "#0c0a14" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-border/60 bg-card/40 p-6 lg:flex">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <img src={pinkyLogo} alt="Pinky mascot" width={36} height={36} className="h-9 w-9 rounded-xl object-cover" />
        <span className="text-lg font-bold tracking-tight">Pinky Pacts</span>
      </Link>
      {[
        { to: "/", label: "Home" },
        { to: "/new", label: "New Pact" },
        { to: "/witness", label: "Witness" },
      ].map((l) => (
        <Link
          key={l.to}
          to={l.to}
          activeOptions={{ exact: l.to === "/" }}
          activeProps={{ className: "bg-primary text-primary-foreground" }}
          inactiveProps={{ className: "text-foreground/70 hover:bg-primary/10" }}
          className="rounded-xl px-4 py-2.5 text-sm font-medium transition"
        >
          {l.label}
        </Link>
      ))}
      <div className="flex items-center gap-2">
        <Link
          to="/profile"
          activeProps={{ className: "bg-primary text-primary-foreground" }}
          inactiveProps={{ className: "text-foreground/70 hover:bg-primary/10" }}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition"
        >
          Profile
        </Link>
        <ThemeToggle />
      </div>
      <p className="mt-auto text-[10px] text-muted-foreground">Pinky Pacts • Devnet • v0.1</p>
    </aside>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const connected = usePinky((s) => s.wallet.connected);
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectWalletGate>
        <div className="flex min-h-screen">
          {connected && <SideNav />}
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-[1080px] pb-24 pt-3 sm:pt-4 lg:pt-8 lg:pb-12">
              <Outlet />
            </div>
          </main>
          {connected && <div className="lg:hidden"><BottomNav /></div>}
          <Toaster position="top-center" />
        </div>
      </ConnectWalletGate>
    </QueryClientProvider>
  );
}
