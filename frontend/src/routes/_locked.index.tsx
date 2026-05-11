import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EnsoCircle } from "@/components/vault/EnsoCircle";
import { Elephant } from "@/components/vault/Elephant";
import { ElephantSilhouette } from "@/components/vault/ElephantSilhouette";
import { lock } from "@/lib/pin";
import { Lock, Settings } from "lucide-react";
import ohmImg from "@/assets/flat-design-om-symbol.png";

export const Route = createFileRoute("/_locked/")({
  head: () => ({
    meta: [
      { title: "Welcome — Ouma's Vault" },
      { name: "description", content: "A calm home for your accounts and passwords." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10 fade-up overflow-hidden">
      {/* Decorative elephants */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img 
          src={ohmImg} 
          alt="" 
          aria-hidden="true"
          className="w-[150%] sm:w-[120%] opacity-[0.05] mix-blend-multiply filter blur-[2px]"
        />
      </div>

      <ElephantSilhouette
        variant="walking"
        size={110}
        color="var(--teal)"
        className="absolute -left-4 top-32 opacity-20 -rotate-6"
      />
      <ElephantSilhouette
        variant="walking"
        size={90}
        color="var(--coral)"
        className="absolute -right-3 top-56 opacity-25 rotate-12 scale-x-[-1]"
      />
      <ElephantSilhouette
        variant="small"
        size={70}
        color="var(--indigo)"
        className="absolute left-6 bottom-44 opacity-20"
      />
      <ElephantSilhouette
        variant="walking"
        size={80}
        color="var(--amber)"
        className="absolute right-4 bottom-56 opacity-25 scale-x-[-1]"
      />
      <header className="w-full max-w-md flex justify-between items-center">
        <span className="text-sm text-muted-foreground font-serif italic">built by Jared (your favorite, obviously)</span>
        <Link
          to="/settings"
          aria-label="Settings"
          className="p-2 rounded-full hover:bg-secondary"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md text-center">
        <div className="relative mb-6 flex items-center justify-center" style={{ width: 280, height: 280 }}>
          <EnsoCircle size={280} spin className="absolute inset-0" />
          <Elephant size={200} className="relative z-10" />
        </div>
        <h1 className="text-4xl font-serif mb-2">Look who's back</h1>
        <p className="text-muted-foreground text-lg mb-10">
          All your none-forgotten passwords all in one place. 
        </p>

        <Link
          to="/vault"
          className="w-full rounded-full py-5 text-lg font-medium bg-primary text-primary-foreground ink-shadow active:scale-[0.98] transition border-2"
          style={{
            borderColor: "color-mix(in oklab, var(--teal) 55%, transparent)",
            boxShadow:
              "0 8px 24px color-mix(in oklab, var(--indigo) 18%, transparent)",
          }}
        >
          Open my vault
        </Link>

        <button
          type="button"
          onClick={() => {
            lock();
            navigate({ to: "/unlock" });
          }}
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Lock className="w-4 h-4" /> Lock
        </button>
      </div>

      <footer className="max-w-md w-full mt-10 text-center">
        <div
          className="rounded-3xl px-6 py-5 border"
          style={{
            borderColor: "color-mix(in oklab, var(--coral) 30%, transparent)",
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--amber) 18%, var(--paper)), color-mix(in oklab, var(--coral) 14%, var(--paper)))",
          }}
        >
          <p className="font-serif italic text-base leading-relaxed">
            Happy Mother's Day, Mother Ouma.
            <br />
            You're 4'11" of pure trouble and I wouldn't trade you for anything.
            Now stop writing passwords on sticky notes and on note books — I built you this.
          </p>
          <p className="font-serif text-lg mt-3" style={{ color: "var(--seal)" }}>
            — Jared (the favorite child)
          </p>
        </div>
      </footer>
    </main>
  );
}
