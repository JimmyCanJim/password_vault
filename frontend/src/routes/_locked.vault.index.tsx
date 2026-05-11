import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { CATEGORIES, type Category, getEntries, type Entry } from "@/lib/vault";
import { CategoryDot, CATEGORY_COLORS } from "@/components/vault/CategoryDot";
import elephantImg from "@/assets/vecteezy_elephant-svg-elephant-cut-file-elephant-vector-elephant_21815088.jpg";
import ohmImg from "@/assets/flat-design-om-symbol.png"

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

      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img 
          src={elephantImg} 
          alt="" 
          aria-hidden="true"
          className="w-[150%] sm:w-[120%] opacity-[0.05] mix-blend-multiply filter blur-[2px]"
        />
      </div>

      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur px-4 py-3 flex items-center gap-3">
        
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        
        <h1 className="text-xl font-serif">My Vault</h1>

      </header>
      <div className="px-4 mt-6 space-y-8">
        {entries.length === 0 ? <p className="text-center py-16">Nothing saved yet.</p> : 
          grouped.map((g) => (
            <section key={g.cat}>
              <h2 className="text-s uppercase font-bold mb-3 flex items-center gap-2" style={{ color: CATEGORY_COLORS[g.cat] }}>
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
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link
          to="/vault/new"
          aria-label="Add new entry"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-2 active:scale-95"
          style={{
            borderColor: "color-mix(in oklab, var(--teal) 55%, transparent)",
            boxShadow: "0 8px 24px color-mix(in oklab, var(--indigo) 25%, transparent)",
          }}
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </main>
  );
}
