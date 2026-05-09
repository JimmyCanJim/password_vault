
# Pinky 🤙 — Prototype Plan

A mobile-first (responsive up to desktop) React prototype of the on-chain accountability app. All data is mocked in a client-side store; no Solana, no Cloud, no real STT.

## Design system (src/styles.css)

Dark theme by default. New OKLCH tokens:
- `--background` near-black with subtle violet tint
- `--primary` Pinky Pink `#FF2D55`
- `--accent-violet` Solana purple, `--accent-cyan` electric cyan
- `--success`, `--danger`, `--warning`
- Gradients: `--gradient-pinky` (pink→violet), `--gradient-solana` (violet→cyan)
- Glass utility class: blurred translucent card with subtle border + glow shadow
- Custom keyframes: `pulse-mic` (pink halo ring), `pinky-lock` (two hooking pinkies + sparkle), `confetti`, `burn`, `waveform-bar`
- Font: Inter via Google Fonts; tabular-nums for countdowns

## Routes (TanStack file-based, all under a shared mobile shell)

- `__root.tsx` — html shell + dark class + QueryClient + Toaster + bottom nav on mobile / sidebar on desktop. Centered 420px phone frame on ≥md screens.
- `/` — **Dashboard**: header with mock wallet pill + SOL balance, "Active Pacts" list of `PactCard`s, empty state, big floating "New Pact 🤙" CTA.
- `/new` — **Voice Creation**: pulsating mic button, animated waveform, transcript ticker, simulated parse → editable summary card (habit, duration, stake, currency, penalty destination, witnesses). "Pinky Promise" lock animation on confirm.
- `/pacts/$pactId` — **Pact Detail**: countdown ring, daily check-in (camera/upload mock), AI coach audio player (fake waveform + play/pause), witness status list, stake + risk meter, penalty destination chip.
- `/witness` — **Witness Portal**: list of invitations + active watches; per-pact Accept/Decline; Vote Complete/Fail toggle that's locked until deadline.
- `/pacts/$pactId/settle` — **Settlement**: Success (confetti + "Pinky Respected 🤙") or Failure (burn effect) state with mock on-chain tx path.
- `/profile` — wallet, witness reputation badge (v2 stub), settings.

## Components (src/components/pinky/)

- `PactCard` — habit name, verified badge, currency icon (SOL/USDC), risk level chip (Low/Med/High/Degenerate based on stake), countdown, mini progress ring.
- `MicOrb` — Siri/ChatGPT-style glowing pink ring with pulse + waveform bars.
- `PinkyPromiseLock` — Framer Motion animation of two pinky icons hooking + sparkle, plays on pact creation.
- `CountdownRing` — SVG progress ring with tabular-num timer.
- `PenaltyDestinationPicker` — 4-tile selector: Split with Witnesses, Donate, Burn 🔥, Prize Pool — each with tooltip.
- `WitnessList` — avatar + name + status (Pending / Accepted / Voted ✅❌).
- `RiskMeter` — gradient bar pink→violet→cyan based on stake.
- `TxProcessingOverlay` — modal stepping through "Locking SOL → Notifying Witnesses → Securing Pact on Devnet" with check animations.
- `TopUpModal` — LI.FI-style mock: source chain dropdown, asset, amount, "Bridge & Stake" button.
- `WalletConnectButton` — Phantom/Solana Mobile mock with connected state.
- `BottomNav` — Home, Witness, New (center FAB), Profile.

## State (mocked)

`src/lib/pinky-store.ts` — Zustand store with:
- `wallet: { connected, address, solBalance, usdcBalance }`
- `pacts: Pact[]` with status `PendingWitnesses | Active | Voting | CompletedSuccess | CompletedFailure | Disputed`
- `witnessInvites: Invite[]`
- Seeded with 3 demo pacts across statuses + 2 invites
- Actions: `createPact`, `acceptInvite`, `vote`, `checkIn`, `settle`

## Tech

- Framer Motion for mic→summary transition, pinky-lock, confetti, page transitions
- Lucide icons: Activity, Mic, Flame, ShieldCheck, Gavel, Pinky-style HandMetal, Coins, Users, Camera, Play, Pause
- Sonner for toasts ("Pinky Respected 🤙", "Pact locked on Devnet")
- No backend; all persistence via Zustand + localStorage

## Out of scope (explicitly mocked)

- Real Solana/wallet adapter, real ElevenLabs STT, real LI.FI bridge, real witness reputation scoring — all UI-only with placeholder hooks ready for later wiring.

## Build order

1. Theme tokens + shell + bottom nav + mock store with seed data
2. Dashboard + PactCard + Pact Detail
3. Voice creation flow + PinkyPromiseLock + TxProcessingOverlay
4. Witness Portal + Settlement screens
5. Top Up modal + Profile + polish (animations, toasts, empty states)
