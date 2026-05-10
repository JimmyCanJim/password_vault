import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CATEGORIES, type Category, type Entry, type EntryInput, entryInputSchema } from "@/lib/vault";

type Props = {
  initial?: Entry;
  onSubmit: (input: EntryInput) => void;
  submitLabel?: string;
};

export function EntryForm({ initial, onSubmit, submitLabel = "Save" }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Account");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [secret, setSecret] = useState(initial?.secret ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = entryInputSchema.safeParse({
      title,
      category,
      username,
      secret,
      website,
      notes,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[String(issue.path[0])] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" error={errors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Email account"
          maxLength={80}
          className="input"
          autoFocus
        />
      </Field>

      <Field label="Type">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full py-2 text-sm border transition ${
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Username or account (optional)" error={errors.username}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. grandma@example.com"
          maxLength={120}
          className="input"
        />
      </Field>

      <Field label="Password / PIN" error={errors.secret}>
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            maxLength={500}
            className="input pr-12 font-mono"
            inputMode="text"
          />
          <button
            type="button"
            onClick={() => setShowSecret((s) => !s)}
            aria-label={showSecret ? "Hide" : "Show"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-secondary"
          >
            {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </Field>

      <Field label="Website (optional)" error={errors.website}>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="e.g. gmail.com"
          maxLength={200}
          className="input"
        />
      </Field>

      <Field label="Notes (optional)" error={errors.notes}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={2000}
          className="input"
        />
      </Field>

      <button
        type="submit"
        className="w-full rounded-full bg-primary text-primary-foreground py-4 text-lg font-medium ink-shadow active:scale-[0.98] transition"
      >
        {submitLabel}
      </button>

      <style>{`
        .input {
          width: 100%;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 0.9rem;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          outline: none;
          transition: border-color 150ms;
        }
        .input:focus { border-color: var(--ring); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">{label}</span>
      {children}
      {error && <span className="block text-sm text-destructive mt-1">{error}</span>}
    </label>
  );
}
