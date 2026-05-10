// src/lib/vault.ts
import { z } from "zod";
import CryptoJS from "crypto-js";
import { saveEntriesToMongo, getEntriesFromMongo } from "./server-actions";

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

function getEncryptionKey() {
  return sessionStorage.getItem("vault.unlocked.key") || "fallback-key";
}

export async function getEntries(): Promise<Entry[]> {
  if (typeof window === "undefined") return [];
  try {
    const encryptedRaw = await getEntriesFromMongo();
    if (!encryptedRaw) return [];
    
    // DECRYPT THE DATA FROM MONGO
    const bytes = CryptoJS.AES.decrypt(encryptedRaw, getEncryptionKey());
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedStr) return []; // Return empty if decryption fails (wrong key)

    const parsed = JSON.parse(decryptedStr);
    return parsed.filter((e: any): e is Entry => entrySchema.safeParse(e).success);
  } catch (error) {
    console.error("Decryption failed", error);
    return [];
  }
}

async function writeAll(entries: Entry[]): Promise<void> {
  // ENCRYPT THE DATA BEFORE SENDING TO MONGO
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(entries), getEncryptionKey()).toString();
  await saveEntriesToMongo({ data: { encryptedData: ciphertext } }); // PASSED AS DATA OBJECT
}

export async function getEntry(id: string): Promise<Entry | undefined> {
  const entries = await getEntries();
  return entries.find((e) => e.id === id);
}

export async function saveEntry(input: EntryInput, id?: string): Promise<Entry> {
  const now = Date.now();
  const entries = await getEntries();
  if (id) {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx >= 0) {
      const updated: Entry = { ...entries[idx], ...input, updatedAt: now };
      entries[idx] = updated;
      await writeAll(entries);
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
  await writeAll(entries);
  return created;
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getEntries();
  await writeAll(entries.filter((e) => e.id !== id));
}

export async function exportJSON(): Promise<string> {
  const entries = await getEntries();
  return JSON.stringify(entries, null, 2);
}

export async function importJSON(json: string): Promise<number> {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid file");
  const valid = parsed
    .map((e) => entrySchema.safeParse(e))
    .filter((r) => r.success)
    .map((r) => r.data as Entry);
  await writeAll(valid);
  return valid.length;
}
