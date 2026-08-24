# Problem 3: Messy React

## What this is

The task hands you a messy `WalletPage` component and asks you to point
out what's wrong with it, then fix it. The grading leans heavily toward
spotting the problems correctly and explaining *why* they matter — the
refactor is there to prove the fixes actually hold up, not the main
event.

The original snippet leans on a few things that were never defined —
`BoxProps`, `useWalletBalances`, `usePrices`, `WalletRow`, `classes`. I
could've stubbed those out with fake type declarations just so the file
type-checks, but that felt like cheating myself out of a real test. So
this folder is a small standalone project with actual (if minimal)
versions of each — [hooks.ts](hooks.ts), [WalletRow.tsx](WalletRow.tsx),
[styles.ts](styles.ts) — so the fixed component genuinely renders and
can be exercised end to end instead of just passing `tsc`.

## What's wrong with it

1. **`lhsPriority` doesn't exist.** The filter computes `balancePriority`
   and then reads `lhsPriority` a line later — a variable nobody ever
   declared. This isn't a style nitpick, it's fatal: the code throws the
   moment it runs.

2. **The filter keeps the wrong balances.** `if (balance.amount <= 0)
   return true` keeps zero and negative balances and throws away the
   positive ones. For a page that's supposed to show what you actually
   hold, that's backwards — it should be `balance.amount > 0`.

3. **`blockchain` is used but was never declared on `WalletBalance`.**
   The interface only lists `currency` and `amount`, yet
   `getPriority(balance.blockchain)` reads it anyway. Nothing stops a
   typo like `blockChain` from slipping through, and anyone reading the
   type can't tell the real shape of the data. Add `blockchain: string`
   to the interface.

4. **`getPriority(blockchain: any)`.** `any` quietly opts this whole
   function out of type checking — any string, misspelled or not, gets
   through. It should just be `string`.

5. **`getPriority` gets rebuilt every render and called way more than it
   needs to.** It doesn't touch props, state, or anything from the
   closure — it has no reason to live inside the component. As written
   it's recreated on every render and invoked up to three times per
   balance during a single sort (once for the filter, twice per
   comparison). Pull it out as a constant lookup table and this becomes
   a single O(1) read instead.

6. **The sort comparator forgets the "equal" case.** When two priorities
   tie, the function just falls off the end without a `return`, so it
   hands `sort()` an `undefined`. That's outside what `sort()` expects
   and can produce flaky ordering depending on the engine. One line,
   `return rightPriority - leftPriority`, covers all three outcomes.

7. **The nested `if`s in the filter are just an `&&` in disguise.**
   `getPriority(...) > -99 && balance.amount > 0` is the whole thing.
   Not a bug by itself, but this kind of unnecessary nesting is exactly
   where bugs like #1 and #2 hide.

8. **`useMemo` depends on `prices`, but never reads it.** The
   filter-and-sort step only touches `balances` — so listing `prices` as
   a dependency means the whole thing recomputes on every price tick for
   no reason, even though nothing about the result changed. Once
   formatting (which *does* need `prices`) gets folded into the same
   memo below, that dependency becomes legitimate again — the lesson
   isn't "never depend on prices," it's "depend on what you actually
   read."

9. **The list gets walked four times when once would do.** `filter` →
   `sort` → map into `formattedBalances` → map again into `rows`. Given
   that the last map doesn't even use `formattedBalances` (see the next
   point), that third pass is pure waste, and the last two collapse
   into one.

10. **`formattedBalances` is built and then ignored — and a wrong type
    annotation hides the bug.** `rows` maps over `sortedBalances`
    (plain `WalletBalance`, no `formatted` field), but the callback
    parameter is typed as `FormattedWalletBalance` anyway. TypeScript
    just trusts that annotation instead of checking it against the real
    array, so it never catches that `balance.formatted` doesn't exist at
    runtime. Every row silently renders `formattedAmount={undefined}`.
    Not just wasted work — an actual bug hiding behind a type lie.

11. **`toFixed()` with no argument rounds to a whole number.** So `0.5`
    ETH shows up as `"1"`. Probably not what anyone wants from a wallet
    balance. Needs an explicit `toFixed(2)`.

12. **A missing price turns into `NaN` with no guard.** If a currency
    isn't in the `prices` map, `prices[balance.currency] *
    balance.amount` quietly becomes `NaN`, and that's what ends up on
    screen. `(prices[balance.currency] ?? 0) * balance.amount` fixes it.

13. **`key={index}` on a list that gets filtered and sorted.** Using the
    index as a key only holds up if the list order never changes — the
    moment it's re-sorted or re-filtered, React can mix up which DOM
    node belongs to which item. Use something derived from the data
    instead, like `` `${blockchain}-${currency}` ``.

14. **Unexplained magic numbers.** `100`, `50`, `30`, `20`, `-99` show up
    in `getPriority` with zero explanation, and `-99` gets compared
    again elsewhere with no obvious link back to where it came from. A
    named constant (`UNKNOWN_BLOCKCHAIN_PRIORITY`) fixes both problems
    at once.

15. **`children` gets pulled out of props and then never used.** The
    component destructures it (so it doesn't spill into `...rest`) but
    the JSX never renders it. If `WalletPage` is meant to wrap children,
    this quietly breaks that. I'm assuming it should be composable, so
    the fix renders `children` alongside the rows.

## How I fixed it

- [wallet.ts](wallet.ts) holds the pure logic — `getPriority` as a
  lookup table instead of a `switch`, and `buildWalletRows`, which does
  filter → sort → format → USD value in a single pass and hands back
  plain data. No React in sight, so it's easy to test on its own.
- [WalletPage.tsx](WalletPage.tsx) is now just wiring: call
  `buildWalletRows` inside a `useMemo`, render the result.
- [hooks.ts](hooks.ts), [WalletRow.tsx](WalletRow.tsx), and
  [styles.ts](styles.ts) are the stand-ins mentioned above, seeded with
  sample data that deliberately covers the edge cases — a zero balance,
  an unrecognized chain, a token with no price.

Mapping the fixes back to the numbered list: `getPriority` moved out and
became a lookup (#3, #4, #5, #14); `WalletBalance` got its missing
`blockchain` field (#3); the filter is one flat boolean expression now
(#1, #2, #7); the sort comparator is a single subtraction (#6);
everything — filter, sort, format, USD value — happens in one memoized
pass with no wasted intermediate array (#8, #9, #10); amounts format
with `toFixed(2)` and missing prices fall back to `0` (#11, #12); the
React key is derived from the data (#13); and `children` actually
renders (#15).

## Running it

```bash
cd src/problem3
npm install
npm run typecheck   # tsc --noEmit, strict mode
npm test            # vitest run
```

It's its own npm package — nothing borrowed from another folder, no
copy-paste-and-clean-up steps. Because `useWalletBalances`, `usePrices`,
`WalletRow`, and `classes` are real (if small) implementations, the
actual component renders for real in the tests, not just type-checks.

13 test cases across two files:

- [wallet.test.ts](wallet.test.ts) — the pure logic on its own (9
  cases): zero/negative balances get dropped, unknown chains get
  excluded, sorting goes by descending priority, a missing price ends
  up as `0` instead of `NaN`, amounts round to 2 decimals.
- [WalletPage.test.tsx](WalletPage.test.tsx) — the actual component,
  rendered with `@testing-library/react` against the sample data in
  [hooks.ts](hooks.ts) (4 cases): only the valid balances show up, in
  the right order; the priceless token shows `$0.00` rather than the
  literal word "NaN"; `children` actually renders; and there's no
  duplicate-key warning from React, which confirms the key fix holds up
  under real reconciliation, not just on paper.

For the fixes that aren't really "testable behavior" — the `any` type,
the redundant per-render `getPriority`, the magic numbers — the honest
way to check those is just to read [wallet.ts](wallet.ts) and
[WalletPage.tsx](WalletPage.tsx) against the list above.
