import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "SOL" | "USDC";
export type PenaltyDestination = "split" | "donate" | "burn" | "prize";
export type PactStatus =
  | "PendingWitnesses"
  | "Active"
  | "Voting"
  | "CompletedSuccess"
  | "CompletedFailure"
  | "Disputed";

export type WitnessStatus = "Pending" | "Accepted" | "Declined" | "VotedComplete" | "VotedFail";

export interface Witness {
  id: string;
  name: string;
  handle: string;
  status: WitnessStatus;
}

export interface CheckIn {
  date: string; // ISO
  note?: string;
  photo?: string; // data URL
}

export interface Pact {
  id: string;
  habit: string;
  description?: string;
  stake: number;
  currency: Currency;
  durationDays: number;
  startedAt: string; // ISO
  deadline: string; // ISO
  penalty: PenaltyDestination;
  witnesses: Witness[];
  status: PactStatus;
  checkIns: CheckIn[];
  createdAt: string;
}

export interface Invite {
  id: string;
  fromName: string;
  fromHandle: string;
  pactId: string;
  habit: string;
  stake: number;
  currency: Currency;
  deadline: string;
}

export interface WalletState {
  connected: boolean;
  address: string;
  solBalance: number;
  usdcBalance: number;
}

export interface UserProfile {
  registered: boolean;
  name: string;
  handle: string;
  email: string;
  avatar?: string; // data URL
}

interface State {
  user: UserProfile;
  wallet: WalletState;
  pacts: Pact[];
  invites: Invite[];
  watching: Pact[]; // pacts I'm a witness on (mock view)
  registerUser: (u: { name: string; handle: string; email: string; password?: string }) => void;
  loginUser: (u: { handle: string; password: string }) => void;
  setAvatar: (avatar: string | undefined) => void;
  connectWallet: (address?: string) => void;
  disconnectWallet: () => void;
  resetAccount: () => void;
  createPact: (p: Omit<Pact, "id" | "createdAt" | "startedAt" | "deadline" | "status" | "checkIns"> & { startNow?: boolean }) => Pact;
  checkIn: (pactId: string, c: CheckIn) => { ok: boolean; reason?: string };
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
  vote: (pactId: string, witnessId: string, complete: boolean) => void;
  settle: (pactId: string, success: boolean) => void;
  giveUp: (pactId: string) => void;
  topUp: (currency: Currency, amount: number) => void;
}

const sameDay = (a: string, b: string) => {
  const da = new Date(a); const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const now = () => new Date().toISOString();
const days = (d: number) => d * 24 * 60 * 60 * 1000;
const iso = (ms: number) => new Date(ms).toISOString();

const seedPacts = (): Pact[] => {
  const t = Date.now();
  return [
    {
      id: "p1",
      habit: "No social media before 9am",
      description: "Phone stays in another room until 9am every weekday.",
      stake: 0.5,
      currency: "SOL",
      durationDays: 30,
      startedAt: iso(t - days(8)),
      deadline: iso(t + days(22)),
      penalty: "burn",
      witnesses: [
        { id: "w1", name: "Maya", handle: "@maya.sol", status: "Accepted" },
        { id: "w2", name: "Jules", handle: "@jules", status: "Accepted" },
        { id: "w1b", name: "Noor", handle: "@noor", status: "Accepted" },
        { id: "w1c", name: "Diego", handle: "@diego.sol", status: "Accepted" },
      ],
      status: "Active",
      checkIns: Array.from({ length: 6 }).map((_, i) => ({ date: iso(t - days(7 - i)) })),
      createdAt: iso(t - days(8)),
    },
    {
      id: "p2",
      habit: "Run 5km, 4x per week",
      stake: 100,
      currency: "USDC",
      durationDays: 60,
      startedAt: iso(t - days(2)),
      deadline: iso(t + days(58)),
      penalty: "donate",
      witnesses: [
        { id: "w3", name: "Kenji", handle: "@kenji", status: "Accepted" },
        { id: "w4", name: "Priya", handle: "@priya", status: "Accepted" },
        { id: "w4b", name: "Sasha", handle: "@sasha", status: "Accepted" },
        { id: "w4c", name: "Tomas", handle: "@tomas.eth", status: "Pending" },
      ],
      status: "Active",
      checkIns: [],
      createdAt: iso(t - days(2)),
    },
    {
      id: "p3",
      habit: "Ship Pinky MVP",
      stake: 2,
      currency: "SOL",
      durationDays: 14,
      startedAt: iso(t - days(15)),
      deadline: iso(t - days(1)),
      penalty: "split",
      witnesses: [
        { id: "w5", name: "Lex", handle: "@lex", status: "VotedComplete" },
        { id: "w6", name: "Ana", handle: "@ana", status: "VotedComplete" },
      ],
      status: "Voting",
      checkIns: Array.from({ length: 12 }).map((_, i) => ({ date: iso(t - days(14 - i)) })),
      createdAt: iso(t - days(15)),
    },
  ];
};

const seedInvites = (): Invite[] => {
  const t = Date.now();
  return [
    { id: "i1", fromName: "Theo", fromHandle: "@theo", pactId: "x1", habit: "Meditate 10 min/day", stake: 0.25, currency: "SOL", deadline: iso(t + days(20)) },
    { id: "i2", fromName: "Sam", fromHandle: "@sam.eth", pactId: "x2", habit: "Write 500 words/day", stake: 50, currency: "USDC", deadline: iso(t + days(45)) },
  ];
};

const seedWatching = (): Pact[] => {
  const t = Date.now();
  return [
    {
      id: "x3",
      habit: "Quit sugar for 21 days",
      stake: 1,
      currency: "SOL",
      durationDays: 21,
      startedAt: iso(t - days(20)),
      deadline: iso(t + days(1)),
      penalty: "prize",
      witnesses: [{ id: "me", name: "You", handle: "@you", status: "Accepted" }],
      status: "Active",
      checkIns: [],
      createdAt: iso(t - days(20)),
    },
  ];
};

export const usePinky = create<State>()(
  persist(
    (set, get) => ({
      user: { registered: true, name: "Demo User", handle: "@demo", email: "demo@pinky.app" },
      wallet: { connected: true, address: "9xQe…F3aK", solBalance: 12.4, usdcBalance: 320.5 },
      pacts: seedPacts(),
      invites: seedInvites(),
      watching: seedWatching(),
      registerUser: ({ name, handle, email }) =>
        set((s) => ({ user: { ...s.user, registered: true, name, handle: handle.startsWith("@") ? handle : "@" + handle, email } })),
      loginUser: ({ handle }) =>
        set((s) => {
          const h = handle.startsWith("@") ? handle : "@" + handle;
          return { user: { ...s.user, registered: true, handle: h, name: s.user.name || h.replace(/^@/, "") } };
        }),
      setAvatar: (avatar) => set((s) => ({ user: { ...s.user, avatar } })),
      connectWallet: (address) =>
        set((s) => ({
          wallet: {
            ...s.wallet,
            connected: true,
            address: address && address.length > 0 ? address : (s.wallet.address || "9xQe…F3aK"),
            solBalance: s.wallet.solBalance || 12.4,
            usdcBalance: s.wallet.usdcBalance || 320.5,
          },
        })),
      disconnectWallet: () => set((s) => ({ wallet: { ...s.wallet, connected: false } })),
      resetAccount: () => {
        get();
        set(() => ({
          user: { registered: false, name: "", handle: "", email: "" },
          wallet: { connected: false, address: "", solBalance: 0, usdcBalance: 0 },
        }));
      },
      createPact: (p) => {
        const t = Date.now();
        const pact: Pact = {
          id: "p" + Math.random().toString(36).slice(2, 8),
          habit: p.habit,
          description: p.description,
          stake: p.stake,
          currency: p.currency,
          durationDays: p.durationDays,
          penalty: p.penalty,
          witnesses: p.witnesses,
          startedAt: iso(t),
          deadline: iso(t + days(p.durationDays)),
          status: p.witnesses.every((w) => w.status === "Accepted") ? "Active" : "PendingWitnesses",
          checkIns: [],
          createdAt: now(),
        };
        set((s) => ({
          pacts: [pact, ...s.pacts],
          wallet: { ...s.wallet, [p.currency === "SOL" ? "solBalance" : "usdcBalance"]: (p.currency === "SOL" ? s.wallet.solBalance : s.wallet.usdcBalance) - p.stake },
        }));
        return pact;
      },
      checkIn: (pactId, c) => {
        const pact = get().pacts.find((p) => p.id === pactId);
        if (!pact) return { ok: false, reason: "Pact not found" };
        if (pact.status !== "Active") return { ok: false, reason: "Pact is not active" };
        const today = c.date || now();
        if (pact.checkIns.some((ci) => sameDay(ci.date, today))) {
          return { ok: false, reason: "Already checked in today" };
        }
        set((s) => ({ pacts: s.pacts.map((p) => (p.id === pactId ? { ...p, checkIns: [...p.checkIns, { ...c, date: today }] } : p)) }));
        return { ok: true };
      },
      acceptInvite: (id) =>
        set((s) => {
          const inv = s.invites.find((i) => i.id === id);
          if (!inv) return s;
          const pact: Pact = {
            id: inv.pactId,
            habit: inv.habit,
            stake: inv.stake,
            currency: inv.currency,
            durationDays: 30,
            startedAt: now(),
            deadline: inv.deadline,
            penalty: "split",
            witnesses: [{ id: "me", name: "You", handle: "@you", status: "Accepted" }],
            status: "Active",
            checkIns: [],
            createdAt: now(),
          };
          return { invites: s.invites.filter((i) => i.id !== id), watching: [pact, ...s.watching] };
        }),
      declineInvite: (id) => set((s) => ({ invites: s.invites.filter((i) => i.id !== id) })),
      vote: (pactId, witnessId, complete) =>
        set((s) => ({
          watching: s.watching.map((p) =>
            p.id === pactId
              ? { ...p, witnesses: p.witnesses.map((w) => (w.id === witnessId ? { ...w, status: complete ? "VotedComplete" : "VotedFail" } : w)) }
              : p
          ),
        })),
      settle: (pactId, success) =>
        set((s) => {
          const pact = s.pacts.find((p) => p.id === pactId);
          if (!pact) return s;
          const refund = success ? pact.stake : 0;
          return {
            pacts: s.pacts.map((p) => (p.id === pactId ? { ...p, status: success ? "CompletedSuccess" : "CompletedFailure" } : p)),
            wallet: {
              ...s.wallet,
              [pact.currency === "SOL" ? "solBalance" : "usdcBalance"]:
                (pact.currency === "SOL" ? s.wallet.solBalance : s.wallet.usdcBalance) + refund,
            },
          };
        }),
      giveUp: (pactId) =>
        set((s) => {
          const pact = s.pacts.find((p) => p.id === pactId);
          if (!pact) return s;
          // Stake is already debited at creation; forfeit = no refund. Witnesses split it (mock view).
          return {
            pacts: s.pacts.map((p) =>
              p.id === pactId ? { ...p, status: "CompletedFailure" } : p
            ),
          };
        }),
      topUp: (currency, amount) =>
        set((s) => ({
          wallet: {
            ...s.wallet,
            [currency === "SOL" ? "solBalance" : "usdcBalance"]:
              (currency === "SOL" ? s.wallet.solBalance : s.wallet.usdcBalance) + amount,
          },
        })),
    }),
    { name: "pinky-store-v4" }
  )
);

export function riskLevel(stake: number, currency: Currency): { label: string; color: string } {
  const usd = currency === "SOL" ? stake * 150 : stake;
  if (usd < 25) return { label: "Low", color: "text-success" };
  if (usd < 100) return { label: "Medium", color: "text-warning" };
  if (usd < 500) return { label: "High", color: "text-primary" };
  return { label: "Degenerate", color: "text-danger" };
}

export function timeLeft(deadlineIso: string): { days: number; hours: number; minutes: number; seconds: number; total: number } {
  const total = new Date(deadlineIso).getTime() - Date.now();
  const t = Math.max(0, total);
  return {
    total,
    days: Math.floor(t / 86400000),
    hours: Math.floor((t % 86400000) / 3600000),
    minutes: Math.floor((t % 3600000) / 60000),
    seconds: Math.floor((t % 60000) / 1000),
  };
}

export function progressPct(pact: Pact): number {
  const start = new Date(pact.startedAt).getTime();
  const end = new Date(pact.deadline).getTime();
  return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
}
