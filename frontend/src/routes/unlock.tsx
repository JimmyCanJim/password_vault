import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { EnsoCircle } from "@/components/vault/EnsoCircle";
import { Elephant } from "@/components/vault/Elephant";
import { ElephantSilhouette } from "@/components/vault/ElephantSilhouette";
import { PinPad } from "@/components/vault/PinPad";
import { hasPin, isUnlocked, setUnlocked, wipeEverything, getActiveVaultId, prepareLogin, finalizeLogin, requestEmailCode, checkEmailCode } from "@/lib/pin";
import { toast } from "sonner";

// Jared's phone — edit this to your real number so the SMS link works.
const JARED_PHONE = "+27 981 0111";

export const Route = createFileRoute("/unlock")({
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      if (!(await hasPin())) throw redirect({ to: "/setup" });
      if (isUnlocked()) throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Unlock — Grandma's Vault" }] }),
  component: UnlockPage,
});

function UnlockPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"pin" | "otp">("pin");
  
  const [pin, setPin] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [tempKey, setTempKey] = useState<string | null>(null);
  
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleUnlock = async () => {
    if (pin.length < 8) return;
    setChecking(true);
    const vaultId = getActiveVaultId();
    const masterKey = await prepareLogin(vaultId, pin);
    
    if (masterKey) {
      setTempKey(masterKey);
      await requestEmailCode(vaultId);
      setStep("otp");
      toast.info("A 6-digit code has been sent to your email");
    } else {
      setShake(true);
      toast.error("That doesn't look right — try again");
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
    const vaultId = getActiveVaultId();
    const isValid = await checkEmailCode(vaultId, otpCode);
    setChecking(false);
    
    if (isValid && tempKey) {
      finalizeLogin(vaultId, tempKey);
      toast.success(`Welcome back, ${vaultId}`);
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
      <ElephantSilhouette variant="small" size={70} color="var(--amber)" className="absolute -right-3 bottom-32 opacity-25" />
      <div className={`w-full max-w-md text-center ${shake ? "animate-pulse" : ""}`}>
        <div className="relative mx-auto mb-4 flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <EnsoCircle size={180} className="absolute inset-0" />
          <Elephant size={130} className="relative z-10" />
        </div>
        
        {step === "pin" && (
          <>
            <h1 className="text-3xl font-serif mb-2">
              Unlock {typeof window !== 'undefined' ? getActiveVaultId() : ''}'s Vault
            </h1>
            <p className="text-muted-foreground mb-8">At least 8 digits. You got this.</p>

            <PinPad value={pin} onChange={setPin} />

            <button
              type="button"
              onClick={handleUnlock}
              disabled={pin.length < 8 || checking}
              className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-4 text-lg font-medium ink-shadow disabled:opacity-40 active:scale-[0.98] transition"
            >
              {checking ? "Checking..." : "Unlock"}
            </button>

            <button
              type="button"
              onClick={() => setShowForgot((v) => !v)}
              className="mt-8 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot your PIN?
            </button>

            <button
              type="button"
              onClick={() => {
                wipeEverything();
                navigate({ to: "/login" });
              }}
              className="block mx-auto mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Not {getActiveVaultId()}? Switch vaults
            </button>

            {showForgot && (
              <div className="mt-4 p-4 rounded-2xl bg-secondary text-sm text-left fade-up space-y-3">
                <p>
                  Tap "Ask Jared" to send him a quick text — he'll help you get
                  back in. Or, if you'd rather start over, you can erase everything
                  and set a new PIN (saved items will be lost).
                </p>
                <a
                  href={`otp:${JARED_PHONE}?&body=${encodeURIComponent(
                    "Hi Jared. I forgot my vault PIN. Help! Jared is just the best isn't he?",
                  )}`}
                  className="block text-center w-full rounded-full bg-primary text-primary-foreground py-3 font-medium border-2"
                  style={{
                    borderColor: "color-mix(in oklab, var(--teal) 55%, transparent)",
                  }}
                >
                  Ask Jared for help
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Erase everything and start over?")) {
                      wipeEverything();
                      navigate({ to: "/setup" });
                    }
                  }}
                  className="w-full rounded-full border border-destructive text-destructive py-3 font-medium hover:bg-destructive hover:text-destructive-foreground transition"
                >
                  Erase and start over
                </button>
              </div>
            )}
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
                {checking ? "Checking..." : "Verify Code"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
