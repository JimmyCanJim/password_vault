"use server"; 
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "./firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { Resend } from "resend";
const apiKey = process.env.RESEND_API_KEY;

const resend = new Resend(apiKey);

if (!apiKey) {
  console.error("Missing RESEND_API_KEY environment variable!");
}

export const savePinToMongo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ vaultId: z.string(), salt: z.string(), hash: z.string(), email: z.string().email().optional() }))
  .handler(async ({ data }) => {
    const docRef = doc(db, "vaults", data.vaultId.toLowerCase());
    const payload: any = { pinSalt: data.salt, pinHash: data.hash };
    if (data.email) payload.email = data.email;
    await setDoc(docRef, payload, { merge: true });
    return true;
  });

export const getPinFromMongo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ vaultId: z.string() }))
  .handler(async ({ data }) => {
    const docRef = doc(db, "vaults", data.vaultId.toLowerCase());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const vault = snap.data();
    if (!vault.pinSalt || !vault.pinHash) return null;
    return { salt: vault.pinSalt as string, hash: vault.pinHash as string };
  });

export const saveEntriesToMongo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ vaultId: z.string(), encryptedData: z.string() }))
  .handler(async ({ data }) => {
    const docRef = doc(db, "vaults", data.vaultId.toLowerCase());
    await setDoc(docRef, { encryptedEntries: data.encryptedData }, { merge: true });
    return true;
  });

export const getEntriesFromMongo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ vaultId: z.string() }))
  .handler(async ({ data }) => {
    const docRef = doc(db, "vaults", data.vaultId.toLowerCase());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return "";
    return (snap.data().encryptedEntries as string) || "";
  });

export const checkUniqueVaultId = createServerFn({ method: "POST" })
  .inputValidator(z.object({ vaultId: z.string() }))
  .handler(async ({ data }) => {
    const docRef = doc(db, "vaults", data.vaultId.toLowerCase());
    const snap = await getDoc(docRef);
    return !snap.exists(); // true if it doesn't exist, false if it does
  });

export const sendEmailOtp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ vaultId: z.string(), email: z.string().optional() }))
  .handler(async ({ data }) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const docRef = doc(db, "vaults", data.vaultId.toLowerCase());
    let targetEmail = data.email;
    if (!targetEmail) {
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().email) {
         targetEmail = snap.data().email;
      } else {
         return false; 
      }
    }
    
    // 2. The Real Email Trigger!
    try {
      await resend.emails.send({
        from: 'Vault Security <onboarding@resend.dev>', 
        to: targetEmail,
        subject: 'Your Vault Unlock Code',
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>Grandma's Vault Verification</h2>
            <p>Someone is trying to unlock the vault <strong>${data.vaultId}</strong>.</p>
            <p>Here is your 6-digit secure code:</p>
            <h1 style="letter-spacing: 5px; color: #4F46E5; font-size: 36px;">${otp}</h1>
            <p style="color: #666; font-size: 12px;">This code expires in 5 minutes. If this wasn't you, ignore this email.</p>
          </div>
        `
      });
      console.log(`📧 SUCCESS: Real email sent to ${targetEmail}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }

    await setDoc(docRef, { 
      otpCode: otp, 
      otpExpires: Date.now() + 5 * 60 * 1000 
    }, { merge: true });

    return true;
  });

export const verifyEmailOtp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ vaultId: z.string(), code: z.string() }))
  .handler(async ({ data }) => {
    const docRef = doc(db, "vaults", data.vaultId.toLowerCase());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    
    const vault = snap.data();
    if (vault.otpCode === data.code && vault.otpExpires > Date.now()) {
      await setDoc(docRef, { otpCode: null, otpExpires: null }, { merge: true });
      return true;
    }
    return false;
  });