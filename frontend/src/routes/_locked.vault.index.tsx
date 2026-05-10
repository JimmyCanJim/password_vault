import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { CATEGORIES, type Category, getEntries, type Entry } from "@/lib/vault";
import { CategoryDot, CATEGORY_COLORS } from "@/components/vault/CategoryDot";

export const Route = createFileRoute("/_locked/vault/")({
  component: VaultList,
});

function VaultList() {
  const [q, setQ] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    getEntries().then(setEntries);
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const s = q.toLowerCase();
    return entries.filter((e) =>
      e.title.toLowerCase().includes(s) ||
      (e.username ?? "").toLowerCase().includes(s) ||
      (e.notes ?? "").toLowerCase().includes(s)
    );
  }, [entries, q]);

  if (entries === null) return <div className="p-20 text-center font-serif italic">Gathering secrets...</div>;

  const grouped = CATEGORIES.map((c) => ({
    cat: c as Category,
    items: filtered.filter((e) => e.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="relative min-h-screen pb-32 fade-up">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-secondary"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-serif">My Vault</h1>
      </header>
      <div className="px-4 mt-6 space-y-8">
        {entries.length === 0 ? <p className="text-center py-16">Nothing saved yet.</p> : 
          grouped.map((g) => (
            <section key={g.cat}>
              <h2 className="text-xs uppercase font-semibold mb-3 flex items-center gap-2" style={{ color: CATEGORY_COLORS[g.cat] }}>
                <CategoryDot category={g.cat} /> {g.cat}
              </h2>
              <ul className="space-y-2">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <Link to="/vault/$id/view" params={{ id: e.id }} className="block bg-card border rounded-2xl p-4">
                      <div className="font-medium">{e.title}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        }
      </div>
    </main>
  );
}
