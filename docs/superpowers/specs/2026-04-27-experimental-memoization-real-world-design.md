# Make `experimentalMemoization` actually pay off in real-world consumers

## Context

`docs/performance-memoization-plan.md` introduced an opt-in `experimentalMemoization` flag on `BaseTable` / `Table`. The Storybook story `src/components/Table/__stories__/stories/RenderCountTreeStory.tsx` demonstrates the win: with the flag on, only the toggled row and its newly visible children re-render.

In a real consumer (arcadia `data-ui/abcd` — `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx`), enabling the flag produced no measurable change in the React DevTools Profiler. Investigation showed two consumer-side anti-patterns and one missing piece in the library wiring; together they fully defeat the flag's intended effect.

This spec covers a coordinated fix in two repos:

- **Library (`gravity-ui/table`)** — wire `MemoBaseCell` into `BaseRow`, add a dev-only stability warning, ship a storybook anti-pattern demo, and write a migration doc.
- **Consumer (arcadia QuotasTable3)** — stabilize `rowAttributes`, route the local `TreeExpandableCell` through the library's `useIsExpanded(row)` hook, and trim the dead code from `collapsibleStateContext.tsx`.

## Verified root causes in QuotasTable3

### Cause 1 — Inline `rowAttributes` defeats `MemoBaseRow.areEqual`

`QuotasTable3.tsx:153`:

```tsx
rowAttributes={(row) => getRowAttributes(row.original)}
```

This arrow is fresh on every `QuotasTable` render. `MemoBaseRow.areEqual` (`src/components/BaseRow/BaseRow.memo.tsx:36`) checks `prev.attributes === next.attributes` — fails for every row. Every row re-renders on every parent render. **This alone fully defeats row memoization.**

### Cause 2 — Custom `CollapsibleStateContext` value invalidates on every toggle

`collapsibleStateContext.tsx:107-117` builds the context value with `React.useMemo(() => ({ state, ... }), [state, ...])`. When any row's expansion flips, `state` becomes a new object → `contextValue` becomes a new ref → every consumer of `useCollapsibleStateContext()` re-renders.

The local `TreeExpandableCell` (`components/TreeExpandableCell/TreeExpandableCell.tsx:23-24`) consumes this context per row via `useRowExpandedState(rowId)` + `useToggleRowState(rowId)`. React context propagation visits consumer subtrees regardless of intermediate `React.memo` — so even after fixing Cause 1, every cell would still re-render when any row toggles.

### Cause 3 — `MemoBaseCell` is exported but never wired

`MemoBaseCell` is exported from `src/index.ts:57` and was promised by Phase 2 of the original plan, but `BaseRow.tsx:115,144` always renders plain `BaseCell`. Inside the row's render path, cells are not memoized. This doesn't matter for "skip an entire row" (the row's render fn doesn't run when `MemoBaseRow.areEqual` returns true), but it does matter for "row's class changed but cell content didn't" — currently every cell re-renders in that case.

## Non-causes (verified)

- TanStack's row/cell ref caching works as expected — `prev.row === next.row` and `prev.cell === next.cell` hold across state changes. No fix needed there.
- The `--_--tree-depth` `style` cache in `BaseTable.tsx:287-298` produces stable refs.
- `cellClassName`, `rowClassName`, `headerClassName` in QuotasTable3 are module-level constants. Already stable.
- `getSubRows`, `getRowId` are module-level. Stable.

## Discovered during implementation

### `aria-rowindex` defeats memoization on tree expansion

`MemoBaseRow.areEqual` originally included `prev['aria-rowindex'] === next['aria-rowindex']`. The `ariaRowIndexMap` in `BaseTable` assigns sequential positions to all visible rows (`useMemo`'d on `[rows]`). When a tree row expands, new rows are inserted, shifting every subsequent row's position by the number of newly visible children. This caused all rows below the expanded point to fail the comparator and re-render — defeating the optimization entirely on tree tables.

**Fix:** removed `'aria-rowindex'` from `areEqual`. The attribute still updates whenever the row re-renders for a legitimate reason (its own state change). The tradeoff is that a screen reader may read a stale position for a row that didn't re-render; this is an acceptable compromise for the `experimental` flag.

### `unstableRowAttributes` is invisible in the cell counter with `MemoBaseCell` wired

After Task L1.1 (wiring `MemoBaseCell`), an inline `rowAttributes` function causes `MemoBaseRow.areEqual` to fail (`prev.attributes !== next.attributes`), making the `<tr>` re-render. However, `MemoBaseCell.areCellPropsEqual` still passes because `cell` refs are stable — so the cell render function is skipped and the render counter (which lives in the cell) stays green.

The cell-visible anti-pattern is **`cellAttributes`** (not `rowAttributes`): an inline `cellAttributes` function defeats `MemoBaseCell.areCellPropsEqual`, causing cell re-renders that are visible in the counter.

Note: `rowAttributes` instability is still wasteful at the row level (React re-renders the `<tr>`, applies DOM diffing) and is visible in React DevTools Profiler — it just doesn't show in the cell counter. The `useStableRefWarning` hook fires for both.

The storybook anti-pattern story was updated to use `unstableCellAttributes` for the counter-visible demo.

## Approach

Five-phase plan, library-first then consumer. Each library phase is independently shippable.

### Phase L1 — Wire `MemoBaseCell` into `BaseRow`

Add optional internal `Cell?: React.FunctionComponent<BaseCellProps<TData>>` to `BaseRowProps`, defaulting to `BaseCell`. Replace the two `<BaseCell />` JSX nodes in `BaseRow.tsx:115,144` with `<Cell />`. `MemoBaseRow` passes `Cell={MemoBaseCell}`. Legacy path (no `experimentalMemoization`) keeps the default — byte-for-byte identical.

This closes the gap where a row's class/attributes change but its cells didn't need to.

### Phase L2 — Dev-only `useStableRefWarning`

New file `src/hooks/useStableRefWarning.ts`. Hook signature:

```ts
function useStableRefWarning(name: string, value: unknown, enabled: boolean): void;
```

Behavior:

- Always a no-op when `process.env.NODE_ENV === 'production'` or `enabled` is false. Hook still runs (rules of hooks), but skips comparison + storage work.
- When active, stores `prev` in a `useRef`, compares on each render. If `prev !== value` AND a per-instance "already warned for this name" flag is false, calls `console.warn` once with:

  ```
  [gravity-ui/table] experimentalMemoization is enabled but `<name>` changes
  reference between renders, which defeats row memoization. Wrap it in
  useCallback or lift it out of the render path.
  See: docs/MIGRATION-experimentalMemoization.md
  ```

  Then sets the flag.

- One warning per `name` per `BaseTable` instance.

Wire into `BaseTable.tsx` for the props the `MemoBaseRow.areEqual` comparator depends on: `rowAttributes`, `cellAttributes`, `cellClassName`, `rowClassName`, `onRowClick`, `getIsCustomRow`, `getIsGroupHeaderRow`, `renderCustomRowContent`, `renderGroupHeader`, `renderGroupHeaderRowContent`, `getGroupTitle`, `groupHeaderClassName`. Pass `enabled = experimentalMemoization`.

Keep `useStableRefWarning` internal — do not export from `src/hooks/index.ts`.

### Phase L3 — Storybook anti-pattern story

New file `src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx`. Same 1050-row tree as `RenderCountTreeStory`, with **three independent toggles**:

1. `experimentalMemoization` — same as today.
2. `unstableRowAttributes` — when on, passes `rowAttributes={(row) => ({...})}` inline; when off, uses a stable module-level ref.
3. `customContextFanout` — when on, wraps the table in a small custom React context whose value invalidates on every expand toggle, and the `NameCell` reads from it via `useContext`. When off, cells use `useIsExpanded(row)`.

Render counters per cell (existing `useRenderCount` hook) make the impact visible. The user can toggle each independently to confirm each anti-pattern's contribution.

### Phase L4 — Migration doc

New file `docs/MIGRATION-experimentalMemoization.md`. Sections:

1. **What memoization can and can't fix.** TanStack already caches Row/Cell refs across state changes. This fork adds React-level memo on top. Doesn't help if cells subscribe to changing context, or if row props change ref every render.
2. **Anti-pattern checklist** with code samples + fix:
   - Inline `rowAttributes` / `cellAttributes` / className functions
   - Custom React contexts read by cells whose value invalidates on table state changes
   - Cells reading `row.getIsExpanded()` directly instead of `useIsExpanded(row)`
   - `state` object rebuilt fresh in `useTable({ state: {...} })` — minor; mention but don't overweight
3. **Verification recipe.** React DevTools Profiler with "Highlight updates when components render" enabled. Toggle a single row; expected commit footprint = toggled row + newly visible children. Anything else is a regression.
4. **Worked example.** The QuotasTable3 fix from Phase C, before/after.

### Phase C — Consumer fix (arcadia QuotasTable3)

Three small edits, ordered for low risk:

#### C1. Stabilize `rowAttributes` in `QuotasTable3.tsx`

Lift to module scope alongside the existing class handlers (lines 102-104):

```tsx
const rowAttributesHandler = (row: Row<QuotasTable3Row>) => getRowAttributes(row.original);
```

Pass `rowAttributes={rowAttributesHandler}` instead of the inline arrow.

#### C2. Migrate `TreeExpandableCell` to library hooks + add `onExpandedChange` bridge

In `components/TreeExpandableCell/TreeExpandableCell.tsx`, replace:

```tsx
import {useRowExpandedState, useToggleRowState} from '../../collapsibleStateContext';
// ...
const expanded = useRowExpandedState(rowId);
const toggleExpanded = useToggleRowState(rowId);
const handleButtonClick = React.useCallback(() => toggleExpanded(), [toggleExpanded]);
```

With:

```tsx
import {useIsExpanded} from '@gravity-ui/table';
// ...
const expanded = useIsExpanded(row);
const handleButtonClick = React.useCallback(() => row.toggleExpanded(), [row]);
```

`useIsExpanded(row)` reads from `RowStateContext` (provided by `MemoBaseRow`), with a `row.getIsExpanded()` fallback for the non-memo path. No subscription to `CollapsibleStateContext` for the per-row bool — context invalidation no longer fans out to every cell.

`row.toggleExpanded()` triggers TanStack's `onExpandedChange`. The custom context owns the persisted state, so we need a bridge:

In `collapsibleStateContext.tsx`, add:

```tsx
export function useSetExpandedFromContext(): OnChangeFn<ExpandedState> {
  const {setState} = useCollapsibleStateContext();
  return React.useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        // ExpandedState can be `true` (expand all) or a record; we persist record form.
        if (next === true) return prev; // shouldn't happen with enableExpanding default; harden if needed
        return next as Record<string, boolean>;
      });
    },
    [setState],
  );
}
```

In `QuotasTable3.tsx`:

```tsx
const expanded = useTableExpandedState();
const onExpandedChange = useSetExpandedFromContext();
// ...
const table = useTable<QuotasTable3Row>({
  columns,
  data: tableData,
  enableExpanding: true,
  getSubRows,
  getRowId,
  onColumnVisibilityChange: setVisibilityState,
  onExpandedChange,
  state: {expanded, columnPinning: defaultColumnPinning, columnVisibility: visibilityState},
});
```

#### C3. Trim `collapsibleStateContext.tsx`

After C2, no consumers of `useRowExpandedState` or `useToggleRowState` remain in QuotasTable3 (verified via grep — they appear only in `TreeExpandableCell.tsx`). Remove:

- `useRowExpandedState`
- `useToggleRowState`
- `getLocalState` (private to the removed hooks)
- `toggleState` (private to the removed hooks)
- `stateRef` (no longer needed once `getLocalState` is gone)

Keep:

- `state`, `setState`, `expandAll`, `collapseAll` — used by `QuotasTable3.tsx:119` and `QuotasPageV2.tsx:108`.
- `useTableExpandedState`, `useGlobalExpandCollapseActions`.
- New: `useSetExpandedFromContext`.

Final `CollapsibleStateContextShape`:

```ts
{
    state: Record<string, boolean>;
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    expandAll: () => void;
    collapseAll: () => void;
}
```

#### C4. Prerequisite check — `useCurrencyVisibilityContext`

`useColumns` depends on `[slug, costVisible, costContext]`, where `costContext = useCurrencyVisibilityContext()` is the entire context return value. If that provider returns a fresh object on every render, `columns` rebuilds every render, defeating optimizations far beyond row memo (TanStack will rebuild internal options).

**Action:** before applying C1–C3, read `ui/utils/currencyVisibilityContext.tsx` and confirm the provider value is `useMemo`'d. If not, either fix it (one-line `useMemo` on the provider's value object) or change `useColumns` to depend on the individual primitives instead of the whole context object. Plan flags this as a check, not a guaranteed change.

## Critical files

### Library — new

- `src/hooks/useStableRefWarning.ts`
- `src/hooks/__tests__/useStableRefWarning.test.tsx`
- `src/components/BaseTable/__tests__/BaseTable.memo.warning.test.tsx`
- `src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx`
- `docs/MIGRATION-experimentalMemoization.md`

### Library — touched

- `src/components/BaseRow/BaseRow.tsx` — add internal `Cell` prop on `BaseRowProps`; replace `<BaseCell />` at lines 115, 144 with `<Cell />` (defaulting to `BaseCell`).
- `src/components/BaseRow/BaseRow.memo.tsx` — pass `Cell={MemoBaseCell}` when rendering `BaseRow`.
- `src/components/BaseTable/BaseTable.tsx` — call `useStableRefWarning` for the tracked props with `enabled = experimentalMemoization`.

### Library — untouched (deliberately)

- `src/components/BaseRow/RowStateContext.ts` — already correct.
- `src/components/BaseCell/BaseCell.tsx`, `BaseCell.memo.tsx` — already correct.
- `src/components/BaseDraggableRow/*` — out of consumer's path here.

### Consumer (arcadia) — touched

- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx` — lift `rowAttributes`, add `onExpandedChange`.
- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/TreeExpandableCell.tsx` — swap to library hooks.
- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx` — remove unused hooks; add `useSetExpandedFromContext`.

### Consumer (arcadia) — prerequisite check (no edits unless needed)

- `ui/utils/currencyVisibilityContext` — verify provider value is `useMemo`'d.

## Tests

- `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx` — extend with a case mounting a 20-row table, `experimentalMemoization=true`, then forcing a row's `className` to change. Assert via `React.Profiler` that only that row's wrapper re-renders, and within it, no cell's render fn fires (because `MemoBaseCell.areCellPropsEqual` returns true).
- `src/hooks/__tests__/useStableRefWarning.test.tsx` — three cases: (1) silent in production (`process.env.NODE_ENV = 'production'` mock), (2) silent when `enabled=false`, (3) warns once per name across multiple unstable-ref renders.
- `src/components/BaseTable/__tests__/BaseTable.memo.warning.test.tsx` — mount with `experimentalMemoization=true` and an inline `rowAttributes`. Spy `console.warn`; assert exactly one warning fires referencing `rowAttributes`. Second render still inline → no second warning.

No new tests in arcadia. The library tests cover the memo path; the consumer fix is mechanical and behavior-preserving (verified manually via Profiler).

## Verification

### Library

1. `npm run typecheck` — clean.
2. `npm test` — all tests pass.
3. `npm start`; open `RenderCountTreeStory` — toggle expansion, verify only the toggled row + new children turn red.
4. Open `RenderCountTreeAntiPatternsStory` — flip each anti-pattern toggle independently; verify the impact matches the migration doc's claims.

### Consumer

1. Bump `@gravity-ui/table` to the new patch.
2. Apply C1–C3.
3. Open the QuotasPage in the dev build; React DevTools Profiler set to "Record why each component rendered".
4. Toggle one provider's expansion. Expected commit: the toggled row + its newly visible children. **Not** every other row.
5. Console: zero `[gravity-ui/table] experimentalMemoization is enabled but ...` warnings.
6. Smoke: expand-all / collapse-all buttons on `QuotasPageV2` still work.

## Rollout

Library first. Consumer follows once the new patch is published.

1. **Library PR 1** — Phase L1 (`MemoBaseCell` wiring) + tests.
2. **Library PR 2** — Phase L2 (`useStableRefWarning`) + tests.
3. **Library PR 3** — Phase L3 (anti-pattern story) + Phase L4 (migration doc).
4. **Arcadia PR** — Phase C (C1–C3); Phase C4 only if the prerequisite check fails.

PRs 1–3 can be combined into a single release if preferred; splitting just makes review tighter.

## Risks

- **`useExpandedState`'s `ExpandedState = true` case in the bridge.** TanStack's `ExpandedState` can be `true` (expand all). The custom context only persists records. Mitigation: the bridge converts `true` to "no-op" and the `expandAll` action remains the source of truth. Document inline.
- **`useCurrencyVisibilityContext` instability** could mask the win. Pre-flight check in Phase C4.
- **`useStableRefWarning` false positives.** A user might have a legitimately-changing `rowAttributes` callback that depends on local state. Mitigation: warning is dev-only, fires once, points at the migration doc which explicitly covers the "wrap in `useCallback`" remedy. Acceptable.
- **`Cell` prop on `BaseRowProps` is internal but typed as public.** Mitigation: keep it undocumented in the migration doc; mark with a `@internal` JSDoc tag. Consumers should not pass it.
- **Other consumer tables (`ConfiscationResultsTable`, `FreeQuotaPage` tree)** likely have the same issues. Out of scope; flag as follow-up.

## Out of scope

- The other consumer tables in the same arcadia repo. Same patterns likely apply; separate work.
- `BaseDraggableRow.memo` — already wired and not in QuotasTable3's render path.
- TanStack-internal optimizations (cell context object stability) — out of our control.
- Generalized "external-state row selector" hook (`useTableRowSelector`). Useful for consumers whose row state lives in Redux/Zustand, but premature without a second consumer asking for it.
