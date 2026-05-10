import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { EnsoCircle } from "@/components/vault/EnsoCircle";
import { Elephant } from "@/components/vault/Elephant";
import { ElephantSilhouette } from "@/components/vault/ElephantSilhouette";
import { PinPad } from "@/components/vault/PinPad";
import { hasPin, setPin, validatePinComplexity } from "@/lib/pin";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
  beforeLoad: async () => { // Must be async
    if (typeof window !== "undefined" && await hasPin()) { // Must await
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Create your PIN — Grandma's Vault" }] }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const complexityError = pin.length === 5 ? validatePinComplexity(pin) : null;
  const canContinue = pin.length === 5 && !complexityError;

  const onContinue = () => {
    if (!canContinue) return;
    setStep("confirm");
  };

  const onConfirm = async () => {
    if (confirm.length !== 5) return;
    if (confirm !== pin) {
      toast.error("PINs don't match — try again");
      setConfirm("");
      return;
    }
    setSaving(true);
    await setPin(pin);
    toast.success("Your vault is ready");
    navigate({ to: "/" });
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
          <p className="font-serif italic text-sm mb-3" style={{ color: "var(--seal)" }}>
            From Jared. Happy Mother's Day.
          </p>
        )}
        <h1 className="text-3xl font-serif mb-2">
          {step === "create" ? "Pick a PIN" : "One more time, for the record"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {step === "create"
            ? "Five digits. Not your birthday. Not 12345. I will know."
            : "Type it again so I know you weren't bluffing."}
        </p>

        {step === "create" ? (
          <>
            <PinPad value={pin} onChange={setPinValue} />
            <div className="min-h-[2rem] mt-4 text-sm">
              {pin.length === 5 && complexityError && (
                <span className="text-destructive">{complexityError}</span>
              )}
              {pin.length === 5 && !complexityError && (
                <span className="text-teal">Looks good ✓</span>
              )}
              {pin.length > 0 && pin.length < 5 && (
                <span className="text-muted-foreground">{5 - pin.length} more…</span>
              )}
            </div>
            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-4 text-lg font-medium ink-shadow disabled:opacity-40 active:scale-[0.98] transition"
            >
              Continue
            </button>

            <details className="mt-6 text-left text-sm text-muted-foreground">
              <summary className="cursor-pointer">PIN tips</summary>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Exactly 5 digits</li>
                <li>Not all the same number</li>
                <li>Not a straight sequence (12345, 54321)</li>
                <li>No three of the same digit in a row</li>
                <li>Avoid common ones like 13579 or 24680</li>
              </ul>
            </details>
          </>
        ) : (
          <>
            <PinPad value={confirm} onChange={setConfirm} />
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setStep("create");
                  setConfirm("");
                }}
                className="flex-1 rounded-full border border-border py-4 text-base hover:bg-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={confirm.length !== 5 || saving}
                className="flex-1 rounded-full bg-primary text-primary-foreground py-4 text-base font-medium ink-shadow disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save PIN"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
