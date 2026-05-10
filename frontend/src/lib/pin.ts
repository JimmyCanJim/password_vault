// PIN management: 5-digit numeric PIN with complexity validation,
// stored as SHA-256(salt + pin) in localStorage. Plain PIN never persisted.

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

export function validatePinComplexity(pin: string): string | null {
  if (!/^\d{5}$/.test(pin)) return "Use exactly 5 digits.";
  if (COMMON_PINS.has(pin)) return "That PIN is too common — try something less obvious.";
  if (/^(\d)\1{4}$/.test(pin)) return "All the same digit isn't safe.";

  // No 3+ same digits in a row
  if (/(\d)\1{2,}/.test(pin)) return "Avoid repeating the same digit three times in a row.";

  // No straight ascending or descending run of 5
  const digits = pin.split("").map(Number);
  let asc = true, desc = true;
  for (let i = 1; i < 5; i++) {
    if (digits[i] !== digits[i - 1] + 1) asc = false;
    if (digits[i] !== digits[i - 1] - 1) desc = false;
  }
  if (asc || desc) return "Try something less predictable than a straight sequence.";

  return null;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + pin);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hasPin(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(PIN_KEY);
}

export async function setPin(pin: string): Promise<void> {
  const salt = randomSalt();
  const hash = await hashPin(pin, salt);
  const rec: PinRecord = { salt, hash };
  localStorage.setItem(PIN_KEY, JSON.stringify(rec));
  setUnlocked(true);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const raw = localStorage.getItem(PIN_KEY);
  if (!raw) return false;
  try {
    const rec = JSON.parse(raw) as PinRecord;
    const hash = await hashPin(pin, rec.salt);
    return hash === rec.hash;
  } catch {
    return false;
  }
}

export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  if (!(await verifyPin(currentPin))) return false;
  await setPin(newPin);
  return true;
}

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}

export function setUnlocked(state: boolean): void {
  if (state) sessionStorage.setItem(UNLOCK_KEY, "1");
  else sessionStorage.removeItem(UNLOCK_KEY);
}

export function lock(): void {
  setUnlocked(false);
}

export function wipeEverything(): void {
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem("vault.entries");
  setUnlocked(false);
}
