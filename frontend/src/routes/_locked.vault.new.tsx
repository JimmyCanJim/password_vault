import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { EntryForm } from "@/components/vault/EntryForm";
import { saveEntry } from "@/lib/vault";
import { toast } from "sonner";

export const Route = createFileRoute("/_locked/vault/new")({
  head: () => ({ meta: [{ title: "Add new — Grandma's Vault" }] }),
  component: NewEntry,
});

function NewEntry() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen pb-12 fade-up">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/vault" aria-label="Back" className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-serif">Add new</h1>
      </header>
      <div className="px-4 pt-6">
        <EntryForm
          submitLabel="Save"
          onSubmit={(input) => {
            saveEntry(input);
            toast.success("Saved");
            navigate({ to: "/vault" });
          }}
        />
      </div>
    </main>
  );
}
