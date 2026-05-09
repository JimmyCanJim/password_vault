import { Link, useLocation } from "@tanstack/react-router";
import { Home, Eye, Plus, User } from "lucide-react";
import { ThemeToggle } from "@/components/pinky/ThemeToggle";

export function BottomNav() {
  const { pathname } = useLocation();
  const is = (p: string) => pathname === p || (p !== "/" && pathname.startsWith(p));
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[440px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="glass-strong relative flex items-center justify-between gap-1 rounded-full px-1.5 py-1.5 shadow-2xl">
        <NavBtn to="/" active={is("/") && pathname === "/"} icon={<Home className="h-5 w-5" />} label="Home" />
        <NavBtn to="/witness" active={is("/witness")} icon={<Eye className="h-5 w-5" />} label="Witness" />
        <Link
          to="/new"
          className="gradient-pinky -mt-7 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-lg glow-pinky transition active:scale-95"
          aria-label="New Pact"
        >
          <Plus className="h-5 w-5" />
        </Link>
        <NavBtn to="/profile" active={is("/profile")} icon={<User className="h-5 w-5" />} label="Profile" />
        <ThemeToggle className="h-9 w-9 shrink-0" />
      </div>
    </nav>
  );
}

function NavBtn({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] transition ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
