import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { CATEGORIES, type Category, getEntries } from "@/lib/vault";
import { CategoryDot, CATEGORY_COLORS } from "@/components/vault/CategoryDot";
import { ElephantSilhouette } from "@/components/vault/ElephantSilhouette";

export const Route = createFileRoute("/_locked/vault/")({
  head: () => ({ meta: [{ title: "My Vault — Grandma's Vault" }] }),
  component: VaultList,
});

function VaultList() {
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);
  void tick;
  const entries = useMemo(() => getEntries(), []);

  const filtered = entries.filter((e) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      e.title.toLowerCase().includes(s) ||
      (e.username ?? "").toLowerCase().includes(s) ||
      (e.notes ?? "").toLowerCase().includes(s)
    );
  });

  const grouped = CATEGORIES.map((c) => ({
    cat: c as Category,
    items: filtered.filter((e) => e.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="relative min-h-screen pb-32 fade-up overflow-hidden">
      <ElephantSilhouette variant="small" size={60} color="var(--teal)" className="absolute right-2 top-24 opacity-15" />
      <ElephantSilhouette variant="walking" size={90} color="var(--coral)" className="absolute -left-3 bottom-28 opacity-15 -rotate-3" />
      <ElephantSilhouette variant="walking" size={80} color="var(--indigo)" className="absolute -right-3 bottom-72 opacity-15 scale-x-[-1]" />
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur rainbow-border-b px-4 py-3 flex items-center gap-3">
        <Link to="/" aria-label="Home" className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-serif brand-gradient-text">My Vault</h1>
      </header>

      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-base"
          />
        </label>
      </div>

      <div className="px-4 mt-6 space-y-8">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6 font-serif text-lg italic">
              Nothing saved yet.
            </p>
            <Link
              to="/vault/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium"
            >
              <Plus className="w-5 h-5" /> Add your first item
            </Link>
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No matches.</p>
        ) : (
          grouped.map((g) => (
            <section key={g.cat}>
              <h2
                className="text-xs uppercase tracking-[0.18em] font-semibold mb-3 flex items-center gap-2"
                style={{ color: CATEGORY_COLORS[g.cat] }}
              >
                <CategoryDot category={g.cat} />
                {g.cat}
              </h2>
              <ul className="space-y-2">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <Link
                      to="/vault/$id/view"
                      params={{ id: e.id }}
                      className="relative block bg-card border border-border rounded-2xl p-4 pl-5 overflow-hidden hover:bg-secondary transition active:scale-[0.99]"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: CATEGORY_COLORS[g.cat] }}
                      />
                      <div className="text-base font-medium">{e.title}</div>
                      {e.username && (
                        <div className="text-sm text-muted-foreground truncate">
                          {e.username}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <Link
        to="/vault/new"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-base font-medium ink-shadow active:scale-95 transition border-2"
        style={{ borderColor: "color-mix(in oklab, var(--teal) 60%, transparent)" }}
      >
        <Plus className="w-5 h-5" style={{ color: "var(--teal)" }} /> Add new
      </Link>
    </main>
  );
}
