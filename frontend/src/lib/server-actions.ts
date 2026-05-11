"use server"; 
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const VAULT_ID = "grandma-main";

export const savePinToMongo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ salt: z.string(), hash: z.string() }))
  .handler(async ({ data }) => {
    // dynamically import here!
    const { getDb } = await import("./db");
    const db = await getDb();
    const collection = db.collection("vaults");
    await collection.updateOne(
      { vaultId: VAULT_ID },
      { $set: { pinSalt: data.salt, pinHash: data.hash } },
      { upsert: true }
    );
    return true;
  });

export const getPinFromMongo = createServerFn({ method: "GET" })
  .handler(async () => {
    // dynamically import here!
    const { getDb } = await import("./db");
    const db = await getDb();
    const collection = db.collection("vaults");
    const vault = await collection.findOne({ vaultId: VAULT_ID });
    if (!vault) return null;
    return { salt: vault.pinSalt as string, hash: vault.pinHash as string };
  });

export const saveEntriesToMongo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ encryptedData: z.string() }))
  .handler(async ({ data }) => {
    // dynamically import here!
    const { getDb } = await import("./db");
    const db = await getDb();
    const collection = db.collection("vaults");
    await collection.updateOne(
      { vaultId: VAULT_ID },
      { $set: { encryptedEntries: data.encryptedData } },
      { upsert: true }
    );
    return true;
  });

export const getEntriesFromMongo = createServerFn({ method: "GET" })
  .handler(async () => {
    // dynamically import here!
    const { getDb } = await import("./db");
    const db = await getDb();
    const collection = db.collection("vaults");
    const vault = await collection.findOne({ vaultId: VAULT_ID });
    return (vault?.encryptedEntries as string) || "";
  });