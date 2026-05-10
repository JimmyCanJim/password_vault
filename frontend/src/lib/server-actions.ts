"use server";
import { getDb } from "./db";

const VAULT_ID = "grandma-main";

export async function savePinToMongo(salt: string, hash: string) {
  const db = await getDb();
  const collection = db.collection("vaults");
  await collection.updateOne(
    { vaultId: VAULT_ID },
    { $set: { pinSalt: salt, pinHash: hash } },
    { upsert: true }
  );
  return true;
}

export async function getPinFromMongo() {
  const db = await getDb();
  const collection = db.collection("vaults");
  const vault = await collection.findOne({ vaultId: VAULT_ID });
  if (!vault) return null;
  return { salt: vault.pinSalt as string, hash: vault.pinHash as string };
}

export async function saveEntriesToMongo(encryptedData: string) {
  const db = await getDb();
  const collection = db.collection("vaults");
  await collection.updateOne(
    { vaultId: VAULT_ID },
    { $set: { encryptedEntries: encryptedData } },
    { upsert: true }
  );
  return true;
}

export async function getEntriesFromMongo() {
  const db = await getDb();
  const collection = db.collection("vaults");
  const vault = await collection.findOne({ vaultId: VAULT_ID });
  return (vault?.encryptedEntries as string) || "";
}