// src/lib/server-actions.ts
"use server";
import { connectDB, VaultModel } from "./db";

const VAULT_ID = "grandma-main"; // Hardcoded for single-user, change if you want multiple users

export async function savePinToMongo(salt: string, hash: string) {
  await connectDB();
  await VaultModel.findOneAndUpdate(
    { vaultId: VAULT_ID },
    { pinSalt: salt, pinHash: hash },
    { upsert: true, new: true }
  );
  return true;
}

export async function getPinFromMongo() {
  await connectDB();
  const vault = await VaultModel.findOne({ vaultId: VAULT_ID });
  if (!vault) return null;
  return { salt: vault.pinSalt, hash: vault.pinHash };
}

export async function saveEntriesToMongo(encryptedData: string) {
  await connectDB();
  await VaultModel.findOneAndUpdate(
    { vaultId: VAULT_ID },
    { encryptedEntries: encryptedData },
    { upsert: true }
  );
  return true;
}

export async function getEntriesFromMongo() {
  await connectDB();
  const vault = await VaultModel.findOne({ vaultId: VAULT_ID });
  return vault?.encryptedEntries || "";
}