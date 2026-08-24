# Problem 2: Fancy Form (Currency Swap)

## Summary

The task is to build a currency swap form based on the skeletal template
provided in this folder, using any library/framework, with input validation
and a focus on usability and visual polish. The original static
`index.html` / `style.css` / `script.js` template has been fully replaced —
the task explicitly allows disregarding it — with a small Vite + React +
TypeScript application.

Live token prices come from `https://interview.switcheo.com/prices.json`,
and token icons come from
`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg`.
Assumptions made where the task left things open-ended:

- **Negative/duplicate/zero-price entries are dropped.** The feed contains
  a few duplicate currencies (e.g. `BUSD` appears twice with different
  prices) and no entries with 0 or missing price in practice, but the code
  defensively keeps only the last occurrence per currency and requires a
  finite, positive price — see `buildTokenList` in
  [src/lib/prices.ts](src/lib/prices.ts).
- **Missing icons fall back to a generated letter-avatar** (`TokenIcon`),
  since a handful of symbols in the price feed (`RATOM`, `STATOM`,
  `STEVMOS`, `STLUNA`, `STOSMO`) have no matching SVG in the icons repo.
- **A token already selected on one side is excluded from the other
  side's list**, so the user can never end up with the same token on both
  sides through the picker (validation still guards the case defensively).
- **"Confirm Swap" simulates the transaction** (loading → success → reset)
  since no real swap backend/wallet was specified — the goal here is to
  demonstrate the interaction, not execute a real trade.
- No component library or global state manager (e.g. Kendo React, Zustand)
  was used — a single form doesn't need one, and it keeps the submission
  dependency-light for an outside reviewer to run.

## Approach

### Stack

Vite + React + TypeScript, styled with Tailwind CSS, with Framer Motion for
the token-picker modal and confirm-button micro-interactions.

### Structure

- [src/lib/types.ts](src/lib/types.ts) — the `Token` shape (`symbol`,
  `price`, `iconUrl`).
- [src/lib/prices.ts](src/lib/prices.ts) — fetches the price feed and
  builds a deduped, sorted token list.
- [src/lib/swap.ts](src/lib/swap.ts) — all the pure logic: converting an
  amount between two tokens by USD price ratio, parsing/validating raw
  text input, and formatting amounts/prices for display. Kept dependency
  -free from React on purpose so it's trivial to unit test.
- [src/hooks/useTokens.ts](src/hooks/useTokens.ts) — loads the token list
  once on mount and exposes `{ tokens, loading, error, refetch }`.
- [src/components/TokenIcon.tsx](src/components/TokenIcon.tsx) — renders
  the token's SVG icon, swapping to a colored letter-avatar on load error.
- [src/components/TokenSelector.tsx](src/components/TokenSelector.tsx) — a
  searchable token-picker modal (rendered through a React portal into
  `document.body` — see the gotcha below).
- [src/components/SwapForm.tsx](src/components/SwapForm.tsx) — the form
  itself: two amount fields that recompute each other live as you type,
  a flip button that swaps both the tokens and the amounts, inline
  validation, and the confirm/loading/success flow.

### A layout gotcha worth documenting

The swap card uses `backdrop-blur-xl` (a `backdrop-filter`), and the token
picker was originally a `position: fixed` overlay rendered *inside* that
card's component tree. Per the CSS spec, `filter`/`backdrop-filter` on an
ancestor makes that ancestor the containing block for `position: fixed`
descendants — so the "full-screen" modal was actually anchoring itself to
the card instead of the viewport, which showed up as the whole form
jumping to a wrong position after picking a token. The fix was to render
the modal through `createPortal(..., document.body)`, which is the correct
pattern for a modal regardless (avoids z-index/overflow-clipping issues
too). This was caught by driving the running app with Playwright during
manual QA, not by the type checker or the unit tests — worth keeping in
mind since it's a non-obvious CSS interaction.

## How to Test

### 1. Automated tests

```bash
cd src/problem2
npm install
npm test        # runs `vitest run`
```

26 cases across three files, all with `jsdom` + `@testing-library/react`
(`fetch` is mocked, so no network calls happen during tests):

- [src/lib/swap.test.ts](src/lib/swap.test.ts) (11 cases) — pure logic:
  conversion math both directions, rejecting empty/zero/negative/malformed
  amounts, decimal formatting/trimming, same-token / missing-token /
  missing-amount validation rules.
- [src/lib/prices.test.ts](src/lib/prices.test.ts) (6 cases) — the price
  feed's dedupe-by-last-occurrence rule, dropping zero/negative/non-finite
  prices, icon URL building, and `fetchTokens`'s error handling on a
  non-OK response.
- [src/components/SwapForm.test.tsx](src/components/SwapForm.test.tsx)
  (9 cases) — the actual component, rendered for real: loading → loaded
  → ETH/USDC defaults, live bidirectional conversion as you type, flip
  swapping both tokens and amounts, Confirm Swap disabled until the
  amount is valid, the full pending → success → reset flow (real timers,
  ~3s), the token picker excluding whichever token is selected on the
  other side, and picking a different token through the picker.

This is what actually caught the `backdrop-filter`/containing-block layout
bug described above in the first place — driving the component this way
during development, not the type checker.

### 2. Type-checking and production build

```bash
npx tsc -b        # type-check only
npm run build     # type-check + Vite production build
```

### 3. Manual QA in a browser (optional)

The automated component tests above cover the same interaction paths, but
seeing it rendered is still worth a look, e.g. to judge the visual polish
the task asks for:

```bash
npm run dev       # starts Vite on http://localhost:5173 (or the next free port)
```

Open the URL and walk through the same checklist the tests encode: prices
loading with a spinner (or a "Try again" error state if the feed fails),
ETH → USDC as the default pair, typing in either field computing the
other live, the flip button swapping both sides, invalid input keeping
"Confirm Swap" disabled with an inline hint, the confirm → pending →
success → reset flow, and resizing to a narrow viewport to confirm the
picker docks to the bottom edge-to-edge with no horizontal overflow.
