import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EnsoCircle } from "@/components/vault/EnsoCircle";
import { Elephant } from "@/components/vault/Elephant";
import { ElephantSilhouette } from "@/components/vault/ElephantSilhouette";
import { PinPad } from "@/components/vault/PinPad";
import { getActiveVaultId, isVaultNameUnique, prepareLogin, finalizeLogin, requestEmailCode, checkEmailCode } from "@/lib/pin";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getActiveVaultId()) {
      throw redirect({ to: "/unlock" });
    }
  },
  head: () => ({ meta: [{ title: "Sign In — Grandma's Vault" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  // We now have THREE steps!
  const [step, setStep] = useState<"name" | "pin" | "otp">("name");
  
  const [vaultId, setVaultId] = useState("");
  const [pin, setPin] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [tempKey, setTempKey] = useState<string | null>(null);
  
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleNextStep = async () => {
    if (!vaultId.trim()) return;
    setChecking(true);
    const isUnique = await isVaultNameUnique(vaultId.trim());
    setChecking(false);
    
    if (isUnique) {
      setShake(true);
      toast.error("That vault doesn't exist");
      setTimeout(() => setShake(false), 500);
      return;
    }
    setStep("pin");
  };

  const handlePinSubmit = async () => {
    if (pin.length < 8) return;
    setChecking(true);
    const masterKey = await prepareLogin(vaultId.trim(), pin);
    
    if (masterKey) {
      // PIN is correct! But don't log them in yet. Request SMS.
      setTempKey(masterKey);
      await requestEmailCode(vaultId.trim());
      setStep("otp");
      toast.info("A 6-digit code has been sent to your email");
    } else {
      setShake(true);
      toast.error("Incorrect PIN");
      setTimeout(() => {
        setShake(false);
        setPin("");
      }, 500);
    }
    setChecking(false);
  };
  
  const handleOtpSubmit = async () => {
    if (otpCode.length !== 6) return;
    setChecking(true);
    const isValid = await checkEmailCode(vaultId.trim(), otpCode);
    setChecking(false);
    
    if (isValid && tempKey) {
      // The code was right! Now we actually save the session and unlock the vault.
      finalizeLogin(vaultId.trim(), tempKey);
      toast.success(`Welcome back, ${vaultId.trim()}`);
      navigate({ to: "/" });
    } else {
      setShake(true);
      toast.error("Incorrect or expired code");
      setTimeout(() => {
        setShake(false);
        setOtpCode("");
      }, 500);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10 fade-up overflow-hidden">
      <ElephantSilhouette variant="walking" size={90} color="var(--indigo)" className="absolute -left-4 top-20 opacity-20" />
      <div className={`w-full max-w-md text-center ${shake ? "animate-pulse" : ""}`}>
        <div className="relative mx-auto mb-4 flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <EnsoCircle size={180} className="absolute inset-0" />
          <Elephant size={130} className="relative z-10" />
        </div>
        
        {step === "name" && (
          <>
            <h1 className="text-3xl font-serif mb-2">Sign In</h1>
            <p className="text-muted-foreground mb-6">Enter your vault name to access your accounts.</p>

            <div className="mb-6">
              <input
                type="text"
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleNextStep(); }}
                placeholder="Vault Name"
                className="w-full text-center text-xl p-3 border-b-2 border-primary bg-transparent focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={vaultId.trim().length === 0 || checking}
              className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-4 text-lg font-medium ink-shadow disabled:opacity-40 active:scale-[0.98] transition"
            >
              {checking ? "Checking..." : "Next"}
            </button>
            <div className="mt-8">
              <Link to="/setup" className="text-sm text-muted-foreground underline-offset-4 hover:underline">Need a new vault? Register here</Link>
            </div>
          </>
        )}

        {step === "pin" && (
          <>
            <h1 className="text-3xl font-serif mb-2">Welcome, {vaultId.trim()}</h1>
            <p className="text-muted-foreground mb-6">Enter your PIN to continue.</p>

            <PinPad value={pin} onChange={setPin} />

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setStep("name"); setPin(""); }}
                className="flex-1 rounded-full border border-border py-4 text-base hover:bg-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePinSubmit}
                disabled={pin.length < 8 || checking}
                className="flex-1 rounded-full bg-primary text-primary-foreground py-4 text-base font-medium ink-shadow disabled:opacity-40"
              >
                {checking ? "Checking..." : "Verify PIN"}
              </button>
            </div>
          </>
        )}
        
        {step === "otp" && (
          <>
            <h1 className="text-3xl font-serif mb-2">Check your phone</h1>
            <p className="text-muted-foreground mb-6">We've sent a 6-digit code to verify it's really you.</p>

            <div className="mb-6">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === "Enter") handleOtpSubmit(); }}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[1em] text-2xl p-3 border-b-2 border-primary bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setStep("pin"); setOtpCode(""); setPin(""); }}
                className="flex-1 rounded-full border border-border py-4 text-base hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOtpSubmit}
                disabled={otpCode.length !== 6 || checking}
                className="flex-1 rounded-full bg-primary text-primary-foreground py-4 text-base font-medium ink-shadow disabled:opacity-40"
              >
                {checking ? "Checking..." : "Unlock Vault"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}