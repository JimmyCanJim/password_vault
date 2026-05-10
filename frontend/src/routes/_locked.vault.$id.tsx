import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { EntryForm } from "@/components/vault/EntryForm";
import { getEntry, saveEntry } from "@/lib/vault";
import { toast } from "sonner";

export const Route = createFileRoute("/_locked/vault/$id")({
  head: () => ({ meta: [{ title: "Edit — Grandma's Vault" }] }),
  component: EditEntry,
});

function EditEntry() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const entry = getEntry(id);

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
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          to="/vault/$id/view"
          params={{ id }}
          aria-label="Back"
          className="p-2 -ml-2 rounded-full hover:bg-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-serif">Edit</h1>
      </header>
      <div className="px-4 pt-6">
        <EntryForm
          initial={entry}
          submitLabel="Save changes"
          onSubmit={(input) => {
            saveEntry(input, id);
            toast.success("Saved");
            navigate({ to: "/vault/$id/view", params: { id } });
          }}
        />
      </div>
    </main>
  );
}
