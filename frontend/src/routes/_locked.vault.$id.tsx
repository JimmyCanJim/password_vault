import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { EntryForm } from "@/components/vault/EntryForm";
import { getEntry, saveEntry, type Entry } from "@/lib/vault";
import { toast } from "sonner";

export const Route = createFileRoute("/_locked/vault/$id")({
  head: () => ({ meta: [{ title: "Edit — Grandma's Vault" }] }),
  component: EditEntry,
});

function EditEntry() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  
  // 1. Create a state to hold the entry while we wait for MongoDB
  const [entry, setEntry] = useState<Entry | null | undefined>(undefined);

  // 2. Fetch the data when the page loads
  useEffect(() => {
    getEntry(id).then(setEntry);
  }, [id]);

  // 3. Show a loading state while waiting
  if (entry === undefined) {
    return <div className="p-20 text-center font-serif italic text-muted-foreground">Loading...</div>;
  }

  // 4. Handle if the item doesn't exist
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

  // 5. Render the form now that 'entry' is definitely an object, not a Promise!
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
          onSubmit={async (input) => {
            // Make sure to await the saveEntry call too!
            await saveEntry(input, id);
            toast.success("Saved");
            navigate({ to: "/vault/$id/view", params: { id } });
          }}
        />
      </div>
    </main>
  );
}
