# Memo-safe row state access without library hooks

## Context

The prior spec [`2026-04-27-experimental-memoization-real-world-design.md`](2026-04-27-experimental-memoization-real-world-design.md) wired `MemoBaseCell` into `BaseRow`, added `useStableRefWarning`, shipped an anti-pattern story, and wrote a migration doc. Phases L1–L4 are merged.

That spec also prescribed a consumer migration: replace local `TreeExpandableCell` internals with the library's `useIsExpanded(row)` hook, plus add an `onExpandedChange` bridge. While correct, the `useIsExpanded` requirement is a friction point — consumer cells need to import a library-specific hook and remember to use it instead of `row.getIsExpanded()`. The hook is invisible magic: a developer writing a new tree cell would naturally reach for `row.getIsExpanded()`, get a stale chevron under memoization, and have no obvious signal that they should swap to `useIsExpanded`.

This spec replaces the consumer-facing hook requirement with a one-line library change that makes `row.getIsExpanded()` work correctly under memoization. The consumer's cell code becomes pure TanStack API.

## Verified mechanics

Under `experimentalMemoization`:

1. `MemoBaseRow.areEqual` skips re-renders when `prev.isExpanded === next.isExpanded` (and other tracked props match). When expansion toggles, the affected row's `areEqual` returns false → row re-renders.
2. Inside the re-rendering row, cells are rendered as `<MemoBaseCell cell={cell} ... />`. TanStack's `cell` ref is stable, all other cell props are stable → `MemoBaseCell.areCellPropsEqual` returns true → **`BaseCell`'s render function is skipped**.
3. Because `BaseCell` doesn't render, `flexRender(cell.column.columnDef.cell, cell.getContext())` doesn't run. The consumer's cell render fn never gets called. The JSX is from the previous render.
4. The data isn't stale — `row.getIsExpanded()` would return the current value. The call site is dead.

`useIsExpanded(row)` works around this by subscribing to `RowStateContext` (provided by `BaseRow`). Context updates cross the `React.memo` boundary, forcing a re-render of any consumer subtree that reads the context.

The cleaner alternative: subscribe `BaseCell` itself to `RowStateContext`. A context update will then re-render `BaseCell`, which re-runs `flexRender`, which calls the consumer's cell fn — at which point `row.getIsExpanded()` returns the fresh value.

## Approach

### One-line change in `BaseCell`

`src/components/BaseCell/BaseCell.tsx`:

```tsx
export const BaseCell = <TData,>({...}: BaseCellProps<TData>) => {
    // Subscribe to row state so the cell re-renders when isExpanded/isSelected/depth
    // change on its row. The value is unused here — call sites read state via
    // row.getIsExpanded() etc., which return current TanStack state. Without this
    // subscription, MemoBaseCell would skip re-renders on row state changes and
    // the consumer's cell fn would not run, leaving the rendered JSX stale.
    React.useContext(RowStateContext);
    // ...rest unchanged
};
```

This single line makes `row.getIsExpanded()` and `row.getIsSelected()` memo-safe inside cell render functions. No consumer-side hook required.

`RowStateContext` is `useMemo`'d in `BaseRow` on `[isSelected, isExpanded, row.depth]`, so the subscription only fires when those values actually change for the row — not on every parent re-render.

### What stays

- `RowStateContext` and `useRowState()` remain in `src/components/BaseRow/RowStateContext.ts`. They are the underlying subscription mechanism.
- `useIsExpanded(row)` remains exported. It is now needed only in one specific situation: when a consumer **wraps their own row-state-aware component with `React.memo`** (e.g., a custom analogue of `TreeExpandableCell`). In that case the consumer's memo comparator may equate `prev.row === next.row` and skip re-renders that the spec's auto-subscribe would normally trigger; `useIsExpanded(row)` adds a context subscription that bypasses that custom memo. Without consumer-side `React.memo`, `row.getIsExpanded()` works directly.
- `MemoBaseRow.areEqual`, `MemoBaseCell.areCellPropsEqual`, `useStableRefWarning` — all unchanged.
- `experimentalMemoization` flag — unchanged.

### What changes

#### Library

1. **`src/components/BaseCell/BaseCell.tsx`** — add `React.useContext(RowStateContext)` near the top of the function body, with a code comment explaining why the value is unused.

2. **`src/components/TreeExpandableCell/TreeExpandableCell.tsx`** — replace `useIsExpanded(row)` with `row.getIsExpanded()`. The library's own component now demonstrates the recommended pattern.

3. **`src/components/Table/__stories__/stories/RenderCountTreeStory.tsx`** — replace `useIsExpanded(row)` with `row.getIsExpanded()` in `NameCell`. Drop the `useIsExpanded` import.

4. **`src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx`** — replace `useIsExpanded(row)` with `row.getIsExpanded()` in `NameCell` and `NameCellWithFanout`. Drop the `useIsExpanded` import. The `customContextFanout` toggle still demonstrates its anti-pattern (a custom context whose value invalidates on every toggle, subscribed per cell, fans out re-renders to all cells regardless of which row toggled).

5. **`docs/MIGRATION-experimentalMemoization.md`** — rewrite the row-state section. Lead with: "Read row state via standard TanStack APIs (`row.getIsExpanded()`, `row.getIsSelected()`). The library's `BaseCell` subscribes to row state internally, so these calls are memo-safe inside cell render functions." Add a sub-section: "Building your own analogue of `TreeExpandableCell` and wrapping it with `React.memo`? Use `useIsExpanded(row)` inside your component — your custom memo comparator can otherwise skip the re-render the BaseCell-level subscription would normally trigger. Without consumer-side `React.memo`, plain `row.getIsExpanded()` is sufficient."

#### Tests

1. **`src/components/BaseCell/__tests__/BaseCell.memo-rowstate.test.tsx`** — new file. Mount a memoized table with a custom cell that reads `row.getIsExpanded()`. Toggle expansion via the table API. Assert: cell render fn was called again, rendered output reflects new state. This is the regression test that locks in the auto-subscribe behavior.

2. **`src/components/BaseRow/__tests__/BaseRow.memo.test.tsx`** — extend existing test. After toggling row expansion, assert that cells of unaffected rows did _not_ re-render (cross-row isolation preserved). And cells of the affected row _did_ re-render (subscription works).

3. The existing `BaseTable.memo.warning.test.tsx` and `useStableRefWarning.test.tsx` are unchanged — these test independent concerns.

#### Consumer (arcadia QuotasTable3)

Same shape as the prior spec's Phase C, with one key simplification: **no library hook imports**.

##### C1. Stabilize `rowAttributes` — unchanged from prior spec

Lift the inline arrow to module scope:

```tsx
const rowAttributesHandler = (row: Row<QuotasTable3Row>) => getRowAttributes(row.original);
```

##### C2. Update `TreeExpandableCell` to standard TanStack API

Replace:

```tsx
import {useRowExpandedState, useToggleRowState} from '../../collapsibleStateContext';
const expanded = useRowExpandedState(rowId);
const toggleExpanded = useToggleRowState(rowId);
const handleButtonClick = React.useCallback(() => toggleExpanded(), [toggleExpanded]);
```

With:

```tsx
const expanded = row.getIsExpanded();
const handleButtonClick = React.useCallback(() => row.toggleExpanded(), [row]);
```

This requires `TreeExpandableCell`'s prop type to take `row: Row<QuotasTable3Row>` instead of `rowId: string`. Update the column def's cell render fn from `<TreeExpandableCell rowId={info.row.id}>` to `<TreeExpandableCell row={info.row}>`. TanStack's `info.row` ref is stable across renders, so this does not introduce a new memoization issue.

No `@gravity-ui/table` hook import. Pure TanStack API.

##### C2b. Add `onExpandedChange` bridge — unchanged from prior spec

The consumer's `CollapsibleStateContext` owns the persisted state. We need to sync it with TanStack's expansion state. In `collapsibleStateContext.tsx`, add:

```tsx
export function useSetExpandedFromContext(): OnChangeFn<ExpandedState> {
  const {setState} = useCollapsibleStateContext();
  return React.useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (next === true) return prev; // expandAll case handled by global action; no-op here
        return next as Record<string, boolean>;
      });
    },
    [setState],
  );
}
```

Wire in `QuotasTable3.tsx`:

```tsx
const expanded = useTableExpandedState();
const onExpandedChange = useSetExpandedFromContext();

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

##### C3. Trim `collapsibleStateContext.tsx` — unchanged from prior spec

After C2, `useRowExpandedState` and `useToggleRowState` (and their private helpers `getLocalState`, `toggleState`, `stateRef`) have no consumers. Remove them. Keep `state`, `setState`, `expandAll`, `collapseAll`, `useTableExpandedState`, `useGlobalExpandCollapseActions`, plus the new `useSetExpandedFromContext`.

##### C4. Prerequisite check — unchanged from prior spec

Before applying C1–C3, verify `useCurrencyVisibilityContext` returns a `useMemo`'d value. If not, fix that one line first or `columns` rebuild on every render and other downstream optimizations are defeated.

## Critical files

### Library — touched

- `src/components/BaseCell/BaseCell.tsx` — add `useContext(RowStateContext)` subscription line + comment.
- `src/components/TreeExpandableCell/TreeExpandableCell.tsx` — drop `useIsExpanded` import; use `row.getIsExpanded()`.
- `src/components/Table/__stories__/stories/RenderCountTreeStory.tsx` — drop hook usage.
- `src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx` — drop hook usage.
- `docs/MIGRATION-experimentalMemoization.md` — rewrite row-state section.

### Library — new

- `src/components/BaseCell/__tests__/BaseCell.memo-rowstate.test.tsx` — regression test for auto-subscribe.

### Library — untouched

- `src/components/BaseRow/RowStateContext.ts` — already correct.
- `src/components/BaseRow/BaseRow.tsx` — already provides `RowStateContext.Provider`.
- `src/components/BaseRow/BaseRow.memo.tsx` — comparator unchanged.
- `src/components/BaseCell/BaseCell.memo.tsx` — comparator unchanged.
- `src/hooks/useStableRefWarning.ts` — independent concern.

### Consumer — touched

- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx` — lift `rowAttributes`; add `onExpandedChange`.
- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/TreeExpandableCell.tsx` — switch to TanStack API.
- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx` — remove unused hooks; add `useSetExpandedFromContext`.

## Verification

### Library

1. `npm run typecheck` — clean.
2. `npm test` — all tests pass, including the new `BaseCell.memo-rowstate.test.tsx`.
3. `npm start`; open `RenderCountTreeStory` with `experimentalMemoization` ON. Toggle a row. Confirm: only the toggled row + newly visible children turn red. Chevron direction matches expansion state (no stale chevrons).
4. Open `RenderCountTreeAntiPatternsStory`. Confirm each anti-pattern still demonstrates its fan-out behavior with the updated `row.getIsExpanded()` cells.
5. Manual diff check: `RenderCountTreeStory` cell render counters should show ~2 cells per row turning red on toggle (Name + ID columns), instead of ~1 with the old `useIsExpanded`-only path. This is the expected over-render trade.

### Consumer

1. Bump `@gravity-ui/table` to the new patch.
2. Apply C1–C3 (and C4 only if the prereq check fails).
3. React DevTools Profiler → "Record why each component rendered." Toggle one provider's row. Expected commit: toggled row + its newly visible children. **Not** every other row.
4. Console: zero `[gravity-ui/table] experimentalMemoization is enabled but ...` warnings.
5. Smoke: expand-all / collapse-all on `QuotasPageV2` work.
6. Smoke: clicking a chevron flips it correctly (regression check on the auto-subscribe wiring).

## Risks

- **Hidden subscription footgun.** `React.useContext(RowStateContext)` with no destructured value looks like dead code. A future contributor could delete it. **Mitigation:** code comment plus name the call site clearly. Optionally extract to a tiny helper `useRowStateSubscription()` whose name documents intent.
- **Other row-state methods (e.g. `row.getIsAllParentsExpanded()`) are not memo-safe.** `RowStateContext` carries `isSelected`, `isExpanded`, `depth`. A consumer reading other state in a memoized cell could still see stale values. **Mitigation:** out of scope for now. If a real consumer hits this, expand `RowStateContext` then; document the supported list in the migration doc.
- **Slight extra re-renders within a toggled row.** All cells of the affected row re-render (today only those calling `useIsExpanded` re-render via context). Cross-row isolation unchanged. Negligible in measured tables (~21 extra cell renders per toggle in the 1050-row demo). Mitigated by `MemoBaseRow` still gating the row-level re-render.
- **`expandAll = true` edge case in the bridge.** TanStack's `ExpandedState` can be the literal `true`. The custom context only persists records. The bridge converts `true` → no-op; `expandAll` action remains the source of truth for "expand everything." Documented inline.
- **Over-eager rebuild of `useCurrencyVisibilityContext` could mask the win.** Pre-flight check (C4) covers this.

## Rollout

1. **Library PR** — `BaseCell` auto-subscribe + storybook updates + library `TreeExpandableCell` cleanup + migration doc rewrite + new regression test.
2. **Arcadia PR** — Phase C (C1–C3); C4 only if prereq check fails.

## Out of scope

- Adding more state to `RowStateContext` (e.g. `isGrouped`, `isAllParentsExpanded`). Wait for a real consumer.
- Making `BaseRow` itself the row pluggable / slot-based. Smart components and the auto-subscribe trick cover the friction; component-slots is a larger change.
- Other consumer tables in the same arcadia repo — same patterns likely apply, separate work.
- `BaseDraggableRow.memo` — unaffected; not in QuotasTable3's render path.

## Comparison with the prior spec

| Concern                    | Prior spec                             | This spec                                      |
| -------------------------- | -------------------------------------- | ---------------------------------------------- |
| Cell reads row state       | `useIsExpanded(row)` (library hook)    | `row.getIsExpanded()` (TanStack API)           |
| Library import in cells    | Required                               | None                                           |
| Cells re-render per toggle | Only those calling the hook            | All cells of the toggled row                   |
| Library implementation     | Cells subscribe via consumer-side hook | `BaseCell` subscribes internally               |
| Migration friction         | Consumer must learn library hook       | Consumer keeps standard TanStack API           |
| Backwards compatibility    | —                                      | `useIsExpanded` still works for legacy callers |

Both designs solve the same correctness problem; this spec moves the subscription from per-cell consumer-managed to per-cell library-managed, removing the hook from the consumer's vocabulary at a small over-render cost.
