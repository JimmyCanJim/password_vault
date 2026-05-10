import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { PinPad } from "@/components/vault/PinPad";
import { changePin, validatePinComplexity, wipeEverything } from "@/lib/pin";
import { exportJSON, importJSON } from "@/lib/vault";
import { toast } from "sonner";

export const Route = createFileRoute("/_locked/settings")({
  head: () => ({ meta: [{ title: "Settings — Grandma's Vault" }] }),
  component: SettingsPage,
});

const SIZES = [
  { label: "Normal", value: "16px" },
  { label: "Large", value: "18px" },
  { label: "Extra large", value: "21px" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const [size, setSize] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("vault.fontSize") ?? "16px"
      : "16px",
  );
  const [pinStep, setPinStep] = useState<"idle" | "current" | "new" | "confirm">("idle");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const applySize = (v: string) => {
    setSize(v);
    document.documentElement.style.setProperty("--app-base-font-size", v);
    localStorage.setItem("vault.fontSize", v);
  };

  const handleExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const n = importJSON(String(reader.result));
        toast.success(`Imported ${n} items`);
      } catch {
        toast.error("That file didn't look right");
      }
    };
    reader.readAsText(file);
  };

  const newError = newPin.length === 5 ? validatePinComplexity(newPin) : null;

  const advancePin = async () => {
    if (pinStep === "current" && currentPin.length === 5) {
      setPinStep("new");
    } else if (pinStep === "new" && newPin.length === 5 && !newError) {
      setPinStep("confirm");
    } else if (pinStep === "confirm" && confirmPin.length === 5) {
      if (confirmPin !== newPin) {
        toast.error("PINs don't match");
        setConfirmPin("");
        return;
      }
      const ok = await changePin(currentPin, newPin);
      if (!ok) {
        toast.error("Current PIN was wrong");
        setPinStep("current");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        return;
      }
      toast.success("PIN updated");
      setPinStep("idle");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    }
  };

  return (
    <main className="min-h-screen pb-16 fade-up">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur rainbow-border-b px-4 py-3 flex items-center gap-3">
        <Link to="/" aria-label="Home" className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-serif brand-gradient-text">Settings</h1>
      </header>

      <div className="px-4 pt-6 space-y-8">
        {/* Text size */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Text size
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => applySize(s.value)}
                className={`rounded-full py-3 text-sm border transition ${
                  size === s.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Change PIN */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            PIN
          </h2>
          {pinStep === "idle" ? (
            <button
              type="button"
              onClick={() => setPinStep("current")}
              className="w-full rounded-full border border-border bg-card py-4 text-base hover:bg-secondary"
            >
              Change PIN
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-muted-foreground">
                {pinStep === "current"
                  ? "Enter your current PIN"
                  : pinStep === "new"
                    ? "Choose a new 5-digit PIN"
                    : "Confirm your new PIN"}
              </p>
              <PinPad
                value={
                  pinStep === "current" ? currentPin : pinStep === "new" ? newPin : confirmPin
                }
                onChange={
                  pinStep === "current"
                    ? setCurrentPin
                    : pinStep === "new"
                      ? setNewPin
                      : setConfirmPin
                }
              />
              {pinStep === "new" && newPin.length === 5 && newError && (
                <p className="text-sm text-destructive text-center">{newError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPinStep("idle");
                    setCurrentPin("");
                    setNewPin("");
                    setConfirmPin("");
                  }}
                  className="flex-1 rounded-full border border-border py-3 hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={advancePin}
                  disabled={
                    (pinStep === "current" && currentPin.length !== 5) ||
                    (pinStep === "new" && (newPin.length !== 5 || !!newError)) ||
                    (pinStep === "confirm" && confirmPin.length !== 5)
                  }
                  className="flex-1 rounded-full bg-primary text-primary-foreground py-3 disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Backup */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Backup
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleExport}
              className="w-full rounded-full border border-border bg-card py-4 hover:bg-secondary"
            >
              Export to file
            </button>
            <label className="block">
              <span className="sr-only">Import file</span>
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <span
                onClick={() => document.getElementById("import-file")?.click()}
                className="block cursor-pointer text-center w-full rounded-full border border-border bg-card py-4 hover:bg-secondary"
              >
                Import from file
              </span>
            </label>
          </div>
        </section>

        {/* Danger */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Danger zone
          </h2>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Erase EVERYTHING (PIN and all saved items)? This cannot be undone.",
                )
              ) {
                wipeEverything();
                navigate({ to: "/setup" });
              }
            }}
            className="w-full rounded-full border border-destructive text-destructive py-4 hover:bg-destructive hover:text-destructive-foreground transition"
          >
            Erase everything
          </button>
        </section>
      </div>
    </main>
  );
}
