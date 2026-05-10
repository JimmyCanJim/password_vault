// src/lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://<YOUR_USER>:<YOUR_PASS>@cluster.mongodb.net/grandmas-vault";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

// We create a single document for Grandma's Vault
const VaultSchema = new mongoose.Schema({
  vaultId: { type: String, required: true, unique: true }, // e.g., "grandma-1"
  pinSalt: { type: String, required: true },
  pinHash: { type: String, required: true },
  encryptedEntries: { type: String, default: "" }
});

export const VaultModel = mongoose.models.Vault || mongoose.model("Vault", VaultSchema);