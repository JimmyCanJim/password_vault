import { savePinToMongo, getPinFromMongo, checkUniqueVaultId, sendEmailOtp, verifyEmailOtp } from "./server-actions";
import { getEntries, forceReEncrypt } from "./vault"; 

const PIN_KEY = "vault.pin";
const UNLOCK_KEY = "vault.unlocked";

export type PinRecord = { salt: string; hash: string };

const COMMON_PINS = new Set([
  "00000", "11111", "22222", "33333", "44444",
  "55555", "66666", "77777", "88888", "99999",
  "12345", "23456", "34567", "45678", "56789",
  "01234", "98765", "87654", "76543", "65432",
  "54321", "43210", "13579", "24680", "12321",
  "13131", "12121", "10101", "10000", "11223",
]);

export function getActiveVaultId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("vault.active_id") || "";
}

export async function hasPin(): Promise<boolean> {
  const id = getActiveVaultId();
  if (!id) return false;
  const pinData = await getPinFromMongo({ data: { vaultId: id } });
  return pinData !== null;
}

// --- NEW MILITARY-GRADE CRYPTO FUNCTIONS ---
function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function deriveMasterKey(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(pin), { name: "PBKDF2" }, false, ["deriveBits"]
  );
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: 600000, hash: "SHA-256" },
    keyMaterial, 256
  );
  
  return Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hashForDatabase(masterKeyHex: string): Promise<string> {
  const data = new TextEncoder().encode("SERVER_AUTH_" + masterKeyHex);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
// -------------------------------------------

export async function setPin(pin: string, vaultId: string, email?: string): Promise<void> {
  const salt = randomSalt();
  const masterKey = await deriveMasterKey(pin, salt);
  const hash = await hashForDatabase(masterKey);
  
  localStorage.setItem("vault.active_id", vaultId); // Remember the user!
  
  await savePinToMongo({ data: { vaultId, salt, hash, email } }); 
  sessionStorage.setItem("vault.unlocked.key", masterKey);
  setUnlocked(true);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const id = getActiveVaultId();
  if (!id) return false;
  const pinData = await getPinFromMongo({ data: { vaultId: id } });
  if (!pinData) return false;
  
  const masterKey = await deriveMasterKey(pin, pinData.salt);
  const hash = await hashForDatabase(masterKey);
  
  if (hash === pinData.hash) {
    sessionStorage.setItem("vault.unlocked.key", masterKey);
    return true;
  }
  return false;
}

export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  if (!(await verifyPin(currentPin))) return false;
  
  const entries = await getEntries();
  const activeId = getActiveVaultId();
  
  // Set the NEW pin (updates DB and sessionStorage with new key)
  await setPin(newPin, activeId);
  
  // Re-encrypt all the entries with the NEW key and save to DB!
  await forceReEncrypt(entries);
  
  return true;
}

export function validatePinComplexity(pin: string): string | null {
  if (!/^\d{8,}$/.test(pin)) return "Use at least 8 digits.";
  
  if (/^(\d)\1+$/.test(pin)) return "All the same digit isn't safe.";

  if (/(\d)\1{2,}/.test(pin)) return "Avoid repeating the same digit three times in a row.";

  const digits = pin.split("").map(Number);
  let asc = true, desc = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) asc = false;
    if (digits[i] !== digits[i - 1] - 1) desc = false;
  }
  if (asc || desc) return "Try something less predictable than a straight sequence.";

  return null;
}

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}

export function setUnlocked(state: boolean): void {
  if (state) {
    sessionStorage.setItem(UNLOCK_KEY, "1");
  } else {
    sessionStorage.removeItem(UNLOCK_KEY);
    sessionStorage.removeItem("vault.unlocked.key"); // CLEAR KEY ON LOCK
  }
}

export function lock(): void {
  setUnlocked(false);
}

export function wipeEverything(): void {
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem("vault.entries");
  localStorage.removeItem("vault.active_id");
  setUnlocked(false);
}

export async function prepareLogin(vaultId: string, pin: string): Promise<string | null> {
  const pinData = await getPinFromMongo({ data: { vaultId: vaultId } });
  if (!pinData) return null;
  
  const masterKey = await deriveMasterKey(pin, pinData.salt);
  const hash = await hashForDatabase(masterKey);
  
  if (hash === pinData.hash) {
    return masterKey; // Return the key, but do NOT unlock the vault yet!
  }
  return null;
}

export function finalizeLogin(vaultId: string, masterKey: string) {
  localStorage.setItem("vault.active_id", vaultId);
  sessionStorage.setItem("vault.unlocked.key", masterKey);
  setUnlocked(true);
}

export async function requestEmailCode(vaultId: string, email?: string) {
  return await sendEmailOtp({ data: { vaultId, email } });
}

export async function checkEmailCode(vaultId: string, code: string) {
  return await verifyEmailOtp({ data: { vaultId, code } });
}

export async function isVaultNameUnique(vaultId: string): Promise<boolean> {
  return await checkUniqueVaultId({ data: { vaultId } });
}