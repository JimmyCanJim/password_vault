import { z } from "zod";

export const CATEGORIES = ["Account", "PIN", "Wi-Fi", "Card", "Note"] as const;
export type Category = (typeof CATEGORIES)[number];

export const entrySchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Please add a name").max(80),
  category: z.enum(CATEGORIES),
  username: z.string().trim().max(120).optional().or(z.literal("")),
  secret: z.string().min(1, "Please add the password or PIN").max(500),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Entry = z.infer<typeof entrySchema>;

export const entryInputSchema = entrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type EntryInput = z.infer<typeof entryInputSchema>;

const KEY = "vault.entries";

export function getEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e): e is Entry => entrySchema.safeParse(e).success);
  } catch {
    return [];
  }
}

export function getEntry(id: string): Entry | undefined {
  return getEntries().find((e) => e.id === id);
}

function writeAll(entries: Entry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function saveEntry(input: EntryInput, id?: string): Entry {
  const now = Date.now();
  const entries = getEntries();
  if (id) {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx >= 0) {
      const updated: Entry = { ...entries[idx], ...input, updatedAt: now };
      entries[idx] = updated;
      writeAll(entries);
      return updated;
    }
  }
  const created: Entry = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  entries.push(created);
  writeAll(entries);
  return created;
}

export function deleteEntry(id: string): void {
  writeAll(getEntries().filter((e) => e.id !== id));
}

export function exportJSON(): string {
  return JSON.stringify(getEntries(), null, 2);
}

export function importJSON(json: string): number {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid file");
  const valid = parsed
    .map((e) => entrySchema.safeParse(e))
    .filter((r) => r.success)
    .map((r) => r.data as Entry);
  writeAll(valid);
  return valid.length;
}
