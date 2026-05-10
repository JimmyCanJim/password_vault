// src/lib/server-actions.ts
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";

const VAULT_ID = "grandma-main";

export const savePinToMongo = createServerFn({ method: "POST" })
  .inputValidator((data: { salt: string; hash: string }) => data)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection("vaults").updateOne(
      { vaultId: VAULT_ID },
      { $set: { pinSalt: data.salt, pinHash: data.hash } },
      { upsert: true }
    );
    return true;
  });

export const getPinFromMongo = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await getDb();
    const vault = await db.collection("vaults").findOne({ vaultId: VAULT_ID });
    if (!vault) return null;
    return { salt: vault.pinSalt as string, hash: vault.pinHash as string };
  });

export const saveEntriesToMongo = createServerFn({ method: "POST" })
  .inputValidator((data: { encryptedData: string }) => data)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection("vaults").updateOne(
      { vaultId: VAULT_ID },
      { $set: { encryptedEntries: data.encryptedData } },
      { upsert: true }
    );
    return true;
  });

export const getEntriesFromMongo = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await getDb();
    const vault = await db.collection("vaults").findOne({ vaultId: VAULT_ID });
    return (vault?.encryptedEntries as string) || "";
  });