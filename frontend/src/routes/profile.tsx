import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Wallet, Award, Settings, LogOut, Bell, Shield, Camera, X } from "lucide-react";
import { usePinky } from "@/lib/pinky-store";
import { TopUpModal } from "@/components/pinky/TopUpModal";
import pinkyLogo from "@/assets/pinky-logo.png";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Pinky Pacts" }] }),
  component: Profile,
});

function Profile() {
  const user = usePinky((s) => s.user);
  const wallet = usePinky((s) => s.wallet);
  const pacts = usePinky((s) => s.pacts);
  const connect = usePinky((s) => s.connectWallet);
  const disconnect = usePinky((s) => s.disconnectWallet);
  const resetAccount = usePinky((s) => s.resetAccount);
  const setAvatar = usePinky((s) => s.setAvatar);
  const [topUp, setTopUp] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const completed = pacts.filter((p) => p.status === "CompletedSuccess").length;
  const broken = pacts.filter((p) => p.status === "CompletedFailure").length;

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5 px-4">
      <header className="flex flex-col items-center gap-3 pt-4">
        <div className="relative">
          <button
            onClick={() => fileRef.current?.click()}
            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-primary/10 shadow-md ring-2 ring-primary/30"
            aria-label="Change profile picture"
          >
            <img
              src={user.avatar || pinkyLogo}
              alt={user.avatar ? "Your profile picture" : "Pinky mascot"}
              width={96}
              height={96}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-6 w-6 text-foreground" />
            </span>
          </button>
          {user.avatar && (
            <button
              onClick={() => setAvatar(undefined)}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-primary-foreground shadow"
              aria-label="Remove profile picture"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickAvatar}
          />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">{user.handle || "@guest"}</h1>
          <p className="text-xs text-muted-foreground">{user.name || "Browsing with mock data"}</p>
          {wallet.connected && <p className="text-[11px] text-muted-foreground tabular">{wallet.address}</p>}
          <button onClick={() => fileRef.current?.click()} className="mt-1 text-[11px] text-primary underline">
            {user.avatar ? "Change photo" : "Add photo"}
          </button>
        </div>
      </header>

      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Wallet</span>
          </div>
          <button onClick={() => (wallet.connected ? disconnect() : connect())} className="text-xs text-muted-foreground underline">
            {wallet.connected ? "Disconnect" : "Connect Phantom"}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">SOL</p>
            <p className="mt-0.5 text-xl font-bold tabular">{wallet.solBalance.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] uppercase text-muted-foreground">USDC</p>
            <p className="mt-0.5 text-xl font-bold tabular">{wallet.usdcBalance.toFixed(2)}</p>
          </div>
        </div>
        <button onClick={() => setTopUp(true)} className="gradient-pinky mt-3 w-full rounded-full py-2 text-sm font-semibold text-primary-foreground">Top Up</button>
      </div>

      <div className="glass rounded-3xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-cyan" />
          <span className="text-sm font-semibold">Witness Reputation</span>
          <span className="ml-auto rounded-full bg-cyan/15 px-2 py-0.5 text-[10px] text-cyan">v2 preview</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="gradient-solana flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-primary-foreground">A+</div>
          <div className="text-xs text-muted-foreground">
            <p>12 pacts witnessed • 96% honest votes</p>
            <p className="mt-0.5">Rep stake: 0.1 SOL</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Active" value={pacts.filter((p) => p.status === "Active").length} />
        <Stat label="Respected" value={completed} className="text-success" />
        <Stat label="Broken" value={broken} className="text-danger" />
      </div>

      <div className="glass divide-y divide-border rounded-3xl">
        <Row icon={<Bell className="h-4 w-4" />} label="Notifications" />
        <Row icon={<Shield className="h-4 w-4" />} label="Privacy & disputes" />
        <Row icon={<Settings className="h-4 w-4" />} label="Settings" />
        <Row
          icon={<LogOut className="h-4 w-4 text-danger" />}
          label="Sign out"
          onClick={resetAccount}
        />
      </div>

      <p className="pb-4 text-center text-[10px] text-muted-foreground">Pinky • Devnet • v0.1</p>
      <TopUpModal open={topUp} onClose={() => setTopUp(false)} />
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className={`text-2xl font-bold tabular ${className || ""}`}>{value}</p>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/40">
      {icon}
      <span>{label}</span>
    </button>
  );
}
