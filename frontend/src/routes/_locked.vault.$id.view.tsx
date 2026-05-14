import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { CategoryDot } from "@/components/vault/CategoryDot";
import { CopyButton } from "@/components/vault/CopyButton";
import { SecretField } from "@/components/vault/SecretField";
import { deleteEntry, getEntry, type Entry } from "@/lib/vault";
import { toast } from "sonner";

export const Route = createFileRoute("/_locked/vault/$id/view")({
  head: () => ({ meta: [{ title: "Item — Grandma's Vault" }] }),
  component: ViewEntry,
});

function ViewEntry() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null | undefined>(undefined);

  useEffect(() => {
    getEntry(id).then(setEntry);
  }, [id]);

  if (entry === undefined) {
    return <div className="p-20 text-center font-serif italic text-muted-foreground">Unlocking...</div>;
  }

  if (!entry) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">This item couldn't be found.</p>
          <Link
            to="/vault"
            className="inline-block rounded-full bg-primary text-primary-foreground px-6 py-3"
          >
            Back to vault
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-12 fade-up">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur rainbow-border-b px-4 py-3 flex items-center gap-3">
        <Link to="/vault" aria-label="Back" className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-serif truncate flex-1">{entry.title}</h1>
        <Link
          to="/vault/$id"
          params={{ id }}
          aria-label="Edit"
          className="p-2 rounded-full hover:bg-secondary"
        >
          <Pencil className="w-5 h-5" />
        </Link>
      </header>

      <div className="px-4 pt-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CategoryDot category={entry.category} /> {entry.category}
        </div>

        {entry.username && (
          <Section label="Username">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex-1 min-w-0 break-all">{entry.username}</span>
              <CopyButton value={entry.username} />
            </div>
          </Section>
        )}

        <Section label="Password / PIN">
          <SecretField value={entry.secret} />
        </Section>

        {entry.website && (
          <Section label="Website">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex-1 min-w-0 break-all">{entry.website}</span>
              <CopyButton value={entry.website} />
            </div>
          </Section>
        )}

        {entry.notes && (
          <Section label="Notes">
            <p className="whitespace-pre-wrap leading-relaxed">{entry.notes}</p>
          </Section>
        )}

        <button
          type="button"
          onClick={async () => {
            if (confirm(`Delete "${entry.title}"?`)) {
              await deleteEntry(entry.id); 
              toast.success("Deleted");
              navigate({ to: "/vault" });
            }
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-destructive text-destructive py-3 mt-4 hover:bg-destructive hover:text-destructive-foreground transition"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </main>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <div className="bg-card border border-border rounded-2xl p-4">{children}</div>
    </div>
  );
}