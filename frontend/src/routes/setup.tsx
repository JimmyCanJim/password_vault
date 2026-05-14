	import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EnsoCircle } from "@/components/vault/EnsoCircle";
import { Elephant } from "@/components/vault/Elephant";
import { ElephantSilhouette } from "@/components/vault/ElephantSilhouette";
import { PinPad } from "@/components/vault/PinPad";
import { hasPin, setPin, validatePinComplexity, isVaultNameUnique, requestEmailCode, checkEmailCode } from "@/lib/pin";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
  beforeLoad: async () => {
    if (typeof window !== "undefined" && await hasPin()) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Create your PIN — Grandma's Vault" }] }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"create" | "confirm" | "email" | "otp">("create");
  
  const [vaultName, setVaultName] = useState("");
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [saving, setSaving] = useState(false);

  const complexityError = pin.length >= 8 ? validatePinComplexity(pin) : null;
  const canContinue = pin.length >= 8 && !complexityError && vaultName.trim().length > 0;

  const onContinue = async () => {
    if (!canContinue) return;
    setSaving(true);
    const isUnique = await isVaultNameUnique(vaultName.trim());
    setSaving(false);
    if (!isUnique) {
      toast.error("That vault name is already taken!");
      return;
    }
    setStep("confirm");
  };

  const onConfirm = async () => {
    if (confirm.length < 8) return;
    if (confirm !== pin) {
      toast.error("PINs don't match — try again");
      setConfirm("");
      return;
    }
    setStep("email");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  const onEmailSubmit = async () => {
    if (!email.includes("@") || !email.includes(".")) return;
    
    setSaving(true);
    await requestEmailCode(vaultName.trim(), email.trim());
    setSaving(false);
    
    setStep("otp");
    toast.info("A 6-digit code has been sent to your email");
  };

  const onOtpSubmit = async () => {
    if (otpCode.length !== 6) return;
    
    setSaving(true);
    const isValid = await checkEmailCode(vaultName.trim(), otpCode);
    if (isValid) {
      await setPin(pin, vaultName.trim(), email.trim());
      toast.success("Your vault is ready");
      navigate({ to: "/" });
    } else {
      toast.error("Incorrect or expired code");
      setOtpCode("");
    }
    setSaving(false);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10 fade-up overflow-hidden">
      <ElephantSilhouette variant="walking" size={90} color="var(--teal)" className="absolute -left-4 top-20 opacity-20 -rotate-3" />
      <ElephantSilhouette variant="small" size={70} color="var(--coral)" className="absolute -right-3 top-40 opacity-25" />
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-4 flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <EnsoCircle size={180} className="absolute inset-0" />
          <Elephant size={130} className="relative z-10" />
        </div>
        
        {step === "create" && (
          <>
            <p className="font-serif italic text-sm mb-3" style={{ color: "var(--seal)" }}>
              From Jared. Happy Mother's Day.
            </p>
            <h1 className="text-3xl font-serif mb-2">Pick a PIN</h1>
            <p className="text-muted-foreground mb-6">At least 8 digits. Not your birthday. Not 12345. I will know.</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Who is this vault for?</label>
              <input 
                type="text" 
                value={vaultName} 
                onChange={(e) => setVaultName(e.target.value)} 
                placeholder="e.g. Gran" 
                className="w-full text-center text-xl p-3 border-b-2 border-primary bg-transparent focus:outline-none"
              />
            </div>
            <PinPad value={pin} onChange={setPinValue} />
            <div className="min-h-[2rem] mt-4 text-sm">
              {pin.length >= 8 && complexityError && (
                <span className="text-destructive">{complexityError}</span>
              )}
              {pin.length >= 8 && !complexityError && (
                <span className="text-teal">Looks good ✓</span>
              )}
              {pin.length > 0 && pin.length < 8 && (
                <span className="text-muted-foreground">{8 - pin.length} more…</span>
              )}
            </div>
            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue || saving}
              className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-4 text-lg font-medium ink-shadow disabled:opacity-40 active:scale-[0.98] transition"
            >
              {saving ? "Checking..." : "Continue"}
            </button>
            <div className="mt-8">
              <Link to="/login" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Already have a vault? Sign in
              </Link>
            </div>
          </>
        )}
        
        {step === "confirm" && (
          <>
            <h1 className="text-3xl font-serif mb-2">One more time, for the record</h1>
            <p className="text-muted-foreground mb-6">Type it again so I know you weren't bluffing.</p>

            <PinPad value={confirm} onChange={setConfirm} />
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setStep("create"); setConfirm(""); }}
                className="flex-1 rounded-full border border-border py-4 text-base hover:bg-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={confirm.length < 8}
                className="flex-1 rounded-full bg-primary text-primary-foreground py-4 text-base font-medium ink-shadow disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
        
        {step === "email" && (
          <>
            <h1 className="text-3xl font-serif mb-2">Add your email address</h1>
            <p className="text-muted-foreground mb-6">We'll use this to send you a secure code when you log in.</p>
            
            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="gran@example.com"
                className="w-full text-center text-xl p-3 border-b-2 border-primary bg-transparent focus:outline-none"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="flex-1 rounded-full border border-border py-4 text-base hover:bg-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onEmailSubmit}
                disabled={!email.includes("@") || !email.includes(".") || saving}
                className="flex-1 rounded-full bg-primary text-primary-foreground py-4 text-base font-medium ink-shadow disabled:opacity-40"
              >
                {saving ? "Sending..." : "Send Code"}
              </button>
            </div>
          </>
        )}
        
        {step === "otp" && (
          <>
            <h1 className="text-3xl font-serif mb-2">Verify it's you</h1>
            <p className="text-muted-foreground mb-6">Enter the 6-digit code sent to {email}.</p>
            
            <div className="mb-6">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === "Enter") onOtpSubmit(); }}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[1em] text-2xl p-3 border-b-2 border-primary bg-transparent focus:outline-none"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setStep("email"); setOtpCode(""); }}
                className="flex-1 rounded-full border border-border py-4 text-base hover:bg-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onOtpSubmit}
                disabled={otpCode.length !== 6 || saving}
                className="flex-1 rounded-full bg-primary text-primary-foreground py-4 text-base font-medium ink-shadow disabled:opacity-40"
              >
                {saving ? "Verifying..." : "Create Vault"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}