
# Grandma's Vault — Mother's Day Gift

A gentle, mobile-first web app where your grandmother can keep her passwords, accounts, and PINs in one calm place. Frontend only — data lives in the browser via `localStorage` for now, so it works immediately. I'll explain at the end exactly how to swap that for a real backend when you're ready.

## Design direction

Inspired by the two images you shared:
- **Enso circle / washi paper** → the overall mood: warm off-white background (#f5f0e6), soft ink-black text, generous whitespace, a single calm circular motif on the home/lock screen, slow soft fade-in transitions. Serif display font (Cormorant) for headings, friendly sans (Nunito) for body — large sizes since she's older.
- **Colorful elephant** → the accent palette: teal, coral, amber, deep indigo as gentle gradient highlights on category cards and the primary action button. Used sparingly so the app stays calm but feels joyful.

Mobile-first: big tap targets (min 56px), bottom-anchored primary action, no tiny icons, high-contrast text, single-column always.

## PIN (required, 5 digits, complexity-checked)

The PIN is **mandatory** — set on first launch, required on every app open.

- Exactly **5 digits**, numeric only.
- Complexity rules (all must pass before "Save PIN" enables):
  - Not all the same digit (no `11111`).
  - No simple ascending or descending runs (no `12345`, `54321`, `01234`, `98765`).
  - No more than 2 identical digits in a row (`11234` ok, `11123` rejected).
  - Cannot be a common/obvious sequence (`12345`, `00000`, `11111`, `12321`, `13579`, `24680`).
  - Confirm by re-entering — both entries must match.
- Stored as a **SHA-256 hash + random salt** in `localStorage` via Web Crypto. Plain PIN is never persisted.
- Auto-lock after **5 minutes** of inactivity, and on tab close/reopen.
- Big numeric PIN pad UI (large round buttons, suited to older hands), with a backspace and a subtle "Clear" link. Live, friendly validation messages ("Try a less obvious number").
- A "Forgot PIN" link explains gently that without it the saved data can't be recovered, and offers to **wipe and start over** (since there's no backend yet, this is the only honest option).

## Pages

1. **First-run / Set PIN (`/setup`)** — shown until a PIN exists. Enso circle, warm copy: "Let's create a private 5-digit PIN to keep your things safe." Two PIN inputs (enter + confirm) with the complexity hints.
2. **Lock screen (`/unlock`)** — shown on every app open and after auto-lock. Enso circle + PIN pad.
3. **Home (`/`)** — after unlock: warm greeting ("Welcome back, Grandma"), big "Open my vault" button, soft Mother's Day note at the bottom.
4. **Vault (`/vault`)** — list of all saved entries grouped by category (Accounts, PINs, Wi-Fi, Cards, Notes). Search bar at top. Big "+ Add new" button fixed at bottom on mobile.
5. **Add / Edit entry (`/vault/new`, `/vault/$id`)** — simple form: Title, Category, Username/Account, Password/PIN (with show/hide eye toggle and copy-to-clipboard button), Website (optional), Notes (optional). Big save button. Validated with zod (required fields, max lengths).
6. **Entry detail (`/vault/$id/view`)** — clean read view with one-tap copy buttons next to each field, Edit and Delete actions.
7. **Settings (`/settings`)** — change PIN (requires current PIN), text-size toggle (Normal / Large / Extra large), export all data as a JSON file (backup), import from JSON, "Wipe everything" with confirmation.

## Behaviors

- **Copy-to-clipboard** on every sensitive field with a "Copied ✓" toast.
- **Show/hide** toggle on every password/PIN field.
- **Search** filters live across title, username, notes.
- **Export / import JSON** so data isn't trapped.
- All entries persist in `localStorage` under one key (`vault.entries`); PIN hash + salt under `vault.pin`.

## Technical details

Stack already in place: TanStack Start + React + Tailwind v4 + shadcn/ui + zod — perfect fit, nothing to add.

Files I'll create:
- `src/styles.css` — extend with zen palette tokens (warm paper bg, ink, plus 4 elephant accent colors) in `oklch`.
- `src/lib/vault.ts` — typed CRUD over `localStorage` (`getEntries`, `saveEntry`, `deleteEntry`, `exportJSON`, `importJSON`) + zod schemas.
- `src/lib/pin.ts` — `validatePinComplexity`, `setPin`, `verifyPin`, `changePin`, `hasPin` (SHA-256 + salt via Web Crypto).
- `src/hooks/use-lock.ts` — unlock state + auto-lock timer (5 min idle, on visibilitychange).
- `src/components/vault/` — `EntryCard`, `EntryForm`, `CategoryIcon`, `CopyButton`, `PinPad`, `EnsoCircle` (SVG).
- `src/routes/setup.tsx`, `unlock.tsx`, `index.tsx`, `vault.tsx` (layout w/ Outlet), `vault.index.tsx`, `vault.new.tsx`, `vault.$id.tsx`, `vault.$id.view.tsx`, `settings.tsx`.
- A small `_locked` layout route gates `/`, `/vault/*`, `/settings` — redirects to `/setup` if no PIN, or `/unlock` if locked.
- Each route gets its own `head()` with proper title + description.

## How to connect a real backend later

Right now everything reads/writes through `src/lib/vault.ts`. That single file is the seam — swap its functions and the rest of the app keeps working. Two easy paths:

1. **Lovable Cloud (recommended, ~10 min)** — I enable Cloud, add a `vault_entries` table with Row Level Security so only the logged-in user sees their rows, add email login, and rewrite `vault.ts` to call Supabase instead of `localStorage`. You get sync across devices and real auth. Just say "enable Lovable Cloud" when you're ready.
2. **Your own backend** — implement any REST API with these endpoints: `GET /entries`, `POST /entries`, `PUT /entries/:id`, `DELETE /entries/:id`. Then in `vault.ts` replace the `localStorage` calls with `fetch()` and add an `Authorization` header. The rest of the UI doesn't change.

**Security note for a real deployment**: stored passwords should be encrypted client-side (master key derived from her PIN via `PBKDF2` + `AES-GCM`) before being sent to any server, so the server never sees plaintext. I'll wire that up when we add the backend. For tomorrow's localStorage-only version, data never leaves her device.

## Out of scope for tomorrow

- Real authentication / multi-device sync (backend step above).
- Server-side encryption.
- Password generator (can add later if she wants).

Approve and I'll build it.
