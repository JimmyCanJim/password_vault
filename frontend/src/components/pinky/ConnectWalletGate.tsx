import { useState } from "react";
import {
  Wallet,
  Loader2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  User,
  AtSign,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  LogIn,
  UserPlus,
} from "lucide-react";
import { usePinky } from "@/lib/pinky-store";

const WALLETS = [
  { id: "phantom", name: "Phantom", color: "from-primary to-accent" },
  { id: "solflare", name: "Solflare", color: "from-accent to-primary" },
  { id: "backpack", name: "Backpack", color: "from-primary/80 to-accent/80" },
];

function randomAddress() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  const pick = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${pick(4)}…${pick(4)}`;
}

type Mode = "choose" | "login" | "register";

export function ConnectWalletGate({ children }: { children: React.ReactNode }) {
  const user = usePinky((s) => s.user);
  const wallet = usePinky((s) => s.wallet);
  const registerUser = usePinky((s) => s.registerUser);
  const loginUser = usePinky((s) => s.loginUser);
  const connect = usePinky((s) => s.connectWallet);

  const [mode, setMode] = useState<Mode>("choose");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; handle?: string; email?: string; password?: string }>({});
  const [pending, setPending] = useState<string | null>(null);

  if (user.registered && wallet.connected) return <>{children}</>;

  const step: "auth" | "wallet" = user.registered ? "wallet" : "auth";

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) err.name = "Enter your name";
    if (!handle.trim() || handle.trim().length < 2) err.handle = "Pick a handle";
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Valid email required";
    if (password.length < 6) err.password = "Min 6 characters";
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    registerUser({
      name: name.trim().slice(0, 60),
      handle: handle.trim().slice(0, 30),
      email: email.trim().slice(0, 120),
      password,
    });
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!handle.trim() || handle.trim().length < 2) err.handle = "Enter your username";
    if (password.length < 6) err.password = "Min 6 characters";
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    loginUser({ handle: handle.trim().slice(0, 30), password });
  };

  const handleConnect = (id: string) => {
    setPending(id);
    setTimeout(() => {
      connect(randomAddress());
      setPending(null);
    }, 900);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* progress */}
        <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-medium">
          <Step n={1} label="Account" active={step === "auth"} done={step === "wallet"} />
          <span className="h-px w-6 bg-border" />
          <Step n={2} label="Wallet" active={step === "wallet"} done={false} />
        </div>

        <div className="glass relative overflow-hidden rounded-3xl p-7">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-accent/40 blur-3xl" />

          <div className="relative">
            <div className="gradient-pinky mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg glow-pinky">
              <HeartHandshake className="h-7 w-7 text-primary-foreground" />
            </div>

            {step === "auth" && mode === "choose" && (
              <>
                <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">Welcome to Pinky</h1>
                <p className="mt-1.5 text-center text-sm text-muted-foreground">
                  Sign in to your account or create a new one to get started.
                </p>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    onClick={() => { setErrors({}); setMode("login"); }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90"
                  >
                    <LogIn className="h-4 w-4" /> Login
                  </button>
                  <button
                    onClick={() => { setErrors({}); setMode("register"); }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-card/60 px-4 py-3.5 text-sm font-semibold text-primary hover:bg-primary/5"
                  >
                    <UserPlus className="h-4 w-4" /> Create account
                  </button>
                </div>
              </>
            )}

            {step === "auth" && mode === "login" && (
              <>
                <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">Login</h1>
                <p className="mt-1.5 text-center text-sm text-muted-foreground">
                  Enter your username and app password.
                </p>

                <form onSubmit={submitLogin} className="mt-6 flex flex-col gap-3">
                  <Field
                    icon={<AtSign className="h-4 w-4" />}
                    placeholder="Username"
                    value={handle}
                    onChange={(v) => setHandle(v.replace(/^@/, ""))}
                    error={errors.handle}
                    maxLength={30}
                  />
                  <Field
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="App password"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    type="password"
                    maxLength={72}
                  />

                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90"
                  >
                    Login <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <button
                  onClick={() => { setMode("choose"); setErrors({}); setPassword(""); }}
                  className="mt-4 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              </>
            )}

            {step === "auth" && mode === "register" && (
              <>
                <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">Create your account</h1>
                <p className="mt-1.5 text-center text-sm text-muted-foreground">
                  Tell Pinky who you are. You'll connect your wallet next.
                </p>

                <form onSubmit={submitRegister} className="mt-6 flex flex-col gap-3">
                  <Field
                    icon={<User className="h-4 w-4" />}
                    placeholder="Your name"
                    value={name}
                    onChange={setName}
                    error={errors.name}
                    maxLength={60}
                  />
                  <Field
                    icon={<AtSign className="h-4 w-4" />}
                    placeholder="handle (e.g. maya)"
                    value={handle}
                    onChange={(v) => setHandle(v.replace(/^@/, ""))}
                    error={errors.handle}
                    maxLength={30}
                  />
                  <Field
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="you@example.com"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    type="email"
                    maxLength={120}
                  />
                  <Field
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="App password (min 6 chars)"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    type="password"
                    maxLength={72}
                  />

                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <button
                  onClick={() => { setMode("choose"); setErrors({}); setPassword(""); }}
                  className="mt-4 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              </>
            )}

            {step === "wallet" && (
              <>
                <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">
                  Welcome, {(user.name || user.handle.replace(/^@/, "")).split(" ")[0]}
                </h1>
                <p className="mt-1.5 text-center text-sm text-muted-foreground">
                  Connect a wallet to seal pacts and stake on your habits.
                </p>

                <div className="mt-6 flex flex-col gap-2.5">
                  {WALLETS.map((w) => (
                    <button
                      key={w.id}
                      disabled={pending !== null}
                      onClick={() => handleConnect(w.id)}
                      className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 px-4 py-3.5 text-left transition hover:border-primary hover:bg-primary/5 disabled:opacity-60"
                    >
                      <span className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${w.color} text-primary-foreground`}>
                          <Wallet className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-semibold">{w.name}</span>
                      </span>
                      {pending === w.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground group-hover:text-primary">Connect</span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { usePinky.getState().resetAccount(); setMode("choose"); }}
                  className="mt-4 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              </>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2">
              <Badge icon={<ShieldCheck className="h-4 w-4 text-primary" />} title="Non-custodial" sub="You hold the keys" />
              <Badge icon={<Sparkles className="h-4 w-4 text-primary" />} title="Solana devnet" sub="Free to try" />
            </div>

            <p className="mt-5 text-center text-[10px] text-muted-foreground">
              By continuing, you agree to the pinky promise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${active || done ? "text-primary" : "text-muted-foreground"}`}>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
          done ? "bg-primary text-primary-foreground" : active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="h-3 w-3" /> : n}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  maxLength,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <div className={`flex items-center gap-2 rounded-2xl border bg-card/60 px-3.5 py-3 transition ${error ? "border-danger" : "border-border/60 focus-within:border-primary"}`}>
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      {error && <p className="mt-1 pl-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}

function Badge({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-primary/5 p-3">
      {icon}
      <p className="mt-1.5 text-[11px] font-semibold">{title}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
