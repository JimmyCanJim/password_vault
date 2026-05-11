import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EnsoCircle } from "@/components/vault/EnsoCircle";
import { Elephant } from "@/components/vault/Elephant";
import { ElephantSilhouette } from "@/components/vault/ElephantSilhouette";
import { PinPad } from "@/components/vault/PinPad";
import { hasPin, isUnlocked, setUnlocked, verifyPin, wipeEverything } from "@/lib/pin";
import { toast } from "sonner";

// Jared's phone — edit this to your real number so the SMS link works.
const JARED_PHONE = "+27 981 0111";

export const Route = createFileRoute("/unlock")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    if (!(await hasPin())) throw redirect({ to: "/setup" });
    if (isUnlocked()) throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Unlock — Grandma's Vault" }] }),
  component: UnlockPage,
});

function UnlockPage() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    if (pin.length !== 5) return;
    (async () => {
      if (await verifyPin(pin)) {
        setUnlocked(true);
        navigate({ to: "/" });
      } else {
        setShake(true);
        toast.error("That doesn't look right — try again");
        setTimeout(() => {
          setShake(false);
          setPin("");
        }, 500);
      }
    })();
  }, [pin, navigate]);

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10 fade-up overflow-hidden">
      <ElephantSilhouette variant="walking" size={90} color="var(--indigo)" className="absolute -left-4 top-20 opacity-20" />
      <ElephantSilhouette variant="small" size={70} color="var(--amber)" className="absolute -right-3 bottom-32 opacity-25" />
      <div className={`w-full max-w-md text-center ${shake ? "animate-pulse" : ""}`}>
        <div className="relative mx-auto mb-4 flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <EnsoCircle size={180} className="absolute inset-0" />
          <Elephant size={130} className="relative z-10" />
        </div>
        <h1 className="text-3xl font-serif mb-2">Prove it's you</h1>
        <p className="text-muted-foreground mb-8">Five digits. You got this, Ouma. Just five.</p>

        <PinPad value={pin} onChange={setPin} />

        <button
          type="button"
          onClick={() => setShowForgot((v) => !v)}
          className="mt-8 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Forgot your PIN?
        </button>

        {showForgot && (
          <div className="mt-4 p-4 rounded-2xl bg-secondary text-sm text-left fade-up space-y-3">
            <p>
              Tap "Ask Jared" to send him a quick text — he'll help you get
              back in. Or, if you'd rather start over, you can erase everything
              and set a new PIN (saved items will be lost).
            </p>
            <a
              href={`sms:${JARED_PHONE}?&body=${encodeURIComponent(
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
      </div>
    </main>
  );
}
