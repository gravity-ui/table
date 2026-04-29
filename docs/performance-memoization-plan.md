# Fix: Row-expansion causes full-table rerender (opt-in, experimental)

## Context

This library wraps `@tanstack/react-table` v8.20.6. Issues [#100](https://github.com/gravity-ui/table/issues/100), [#125](https://github.com/gravity-ui/table/issues/125), [#138](https://github.com/gravity-ui/table/issues/138) all report the same underlying problem: any state change in the parent (expansion, selection, sort, scroll in virtualized mode) re-renders every row and every cell, producing ~8ms/commit on modest tables and catastrophic slowdowns on large ones. Upstream TanStack only updates the affected components; this fork regressed by removing memoization.

**Design constraint:** The fix must be **opt-in / experimental**. The default code path must stay byte-for-byte equivalent to the current version so consumers can roll out the optimization gradually and roll back trivially.

### Root cause (verified)

1. `BaseRow` (`src/components/BaseRow/BaseRow.tsx:45`) is only `React.forwardRef` — no `React.memo`.
2. `BaseCell` (`src/components/BaseCell/BaseCell.tsx:18`) is a plain function component — no `React.memo`.
3. `BaseDraggableRow` (`src/components/BaseDraggableRow/BaseDraggableRow.tsx:16`) — no `React.memo`.
4. `BaseTable.renderBodyRows` (`src/components/BaseTable/BaseTable.tsx:215-264`) rebuilds fresh `rowProps` (including a fresh `style` object for tree depth) on every render and passes them to non-memoized rows.

TanStack **does** cache Row / Cell references across state changes — verified in `@tanstack/table-core/src/utils/getCoreRowModel.ts` (`memo` keyed on `[table.options.data]`) and `getExpandedRowModel.ts` (reuses existing row refs, only rebuilds the flat array). Prop-shallow memoization is correct infrastructure — BUT row methods like `row.getIsSelected()` and `row.getIsExpanded()` read live state from the table, so a naïve `React.memo(BaseRow)` keyed only on `row` would skip re-renders when a row's own selection/expansion flips. Fix: pass those state slices as **explicit props**.

## Opt-in API

Single new prop on `BaseTableProps` (propagates through `Table` too):

```ts
/**
 * EXPERIMENTAL. Enables React.memo on rows and cells to avoid full-table
 * re-renders when expansion / selection / sort state changes. Default: false.
 * If your custom cells read `row.getIsExpanded()` or `row.getIsSelected()`
 * directly, migrate them to the `useRowState()` hook before enabling this.
 * API may change — do not rely on it in production yet.
 */
experimentalMemoization?: boolean;
```

Defaults to `false`. When `false`, `BaseTable.renderBodyRows` produces the **exact** JSX tree and props it does today — zero behavioural change, zero perf change.

When `true`, `BaseTable` switches to memoized row/cell components and computes explicit `isSelected`/`isExpanded` props + stable `style` refs.

## Approach

Five phases, each independently shippable. The old non-memoized path is never touched.

### Phase 0 — Instrumentation (dev-only, always on)

- Add `src/hooks/useRenderCount.ts` — dev-only hook, gated on `process.env.NODE_ENV !== 'production'`.
- Add Storybook story `src/components/Table/__stories__/stories/RenderCountTreeStory.tsx` that renders a 1k-row tree with a toggle for `experimentalMemoization`, showing per-row render count so the difference is visible at a glance.

### Phase 1 — New memoized `BaseRow` (sibling file, does not replace)

New file: `src/components/BaseRow/BaseRow.memo.tsx`

- Exports `MemoBaseRow` — a `React.memo` wrapper around a new inner component with props extended by `isSelected: boolean` and `isExpanded: boolean`.
- Reads `isSelected` from the prop (not `row.getIsSelected()`).
- Provides `RowStateContext` to children with `{ isSelected, isExpanded, depth }` (value `useMemo`'d on the three primitives).
- Custom comparator compares: `row`, `isSelected`, `isExpanded`, `virtualItem?.start`, `virtualItem?.size`, individual `style` tree-depth fields, every function prop by reference (`cellClassName`, `className`, `onClick`, `getIsCustomRow`, `getIsGroupHeaderRow`, `renderCustomRowContent`, `renderGroupHeader`, `renderGroupHeaderRowContent`, `getGroupTitle`, `attributes`, `cellAttributes`), primitives `aria-rowindex`, `aria-selected`, `groupHeaderClassName`, `table`.

`src/components/BaseRow/BaseRow.tsx` is **not modified**.

### Phase 2 — New memoized `BaseCell` + `RowStateContext`

- New file `src/components/BaseRow/RowStateContext.ts`: exports `RowStateContext` (React context of `{ isSelected, isExpanded, depth }`) and `useRowState()` hook that returns the context value or `undefined` if no provider is present (so cells work in both modes).
- New file `src/components/BaseCell/BaseCell.memo.tsx`: `MemoBaseCell` — `React.memo` wrapper with shallow compare of `cell`, `className`, `attributes`, `style`, `children`, `colSpan`, `aria-colindex`.
- `TreeExpandableCell` and `BaseGroupHeader` switch to a new tiny helper `useIsExpanded(row)` that reads `useRowState()?.isExpanded ?? row.getIsExpanded()`. This is a 1-line migration and is backward compatible — works in both memoized and non-memoized modes. Tiny change to existing files:
  - `src/components/TreeExpandableCell/TreeExpandableCell.tsx:22`
  - `src/components/BaseGroupHeader/BaseGroupHeader.tsx:24`
- Export `RowStateContext`, `useRowState`, `useIsExpanded` from `src/index.ts` so user cells can migrate.

### Phase 3 — New memoized `BaseDraggableRow`

- New file: `src/components/BaseDraggableRow/BaseDraggableRow.memo.tsx` — `MemoBaseDraggableRow` wrapping `MemoBaseRow`, same comparator keys.
- Original `src/components/BaseDraggableRow/BaseDraggableRow.tsx` untouched.

### Phase 4 — Wire the flag in `BaseTable`

- `src/components/BaseTable/BaseTable.tsx`:
  - Add `experimentalMemoization?: boolean` to `BaseTableProps`, default `false`.
  - In `renderBodyRows` (lines 215-264): branch on the flag.
    - `false` (default): existing code path untouched — same JSX, same props, same allocations.
    - `true`: compute `isSelected` and `isExpanded`, stabilize per-row `style` via a `useRef<WeakMap>` or id-keyed cache, and render `MemoBaseRow` / `MemoBaseDraggableRow` instead.
  - Pass the flag through `Table` → `BaseTable` (it already spreads `...props`, so just threading the type through `TableProps` and `BaseTableProps` is enough).

### Phase 5 — Tests, docs, release

- Jest tests (both modes exercised):
  - `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx`: mount a 20-row table with `experimentalMemoization`, spy render count on each row, assert only the affected row(s) re-render on selection/expansion toggle. Second test confirms legacy mode still renders every row (regression guard for the opt-out path).
  - `src/components/BaseCell/__tests__/BaseCell.memo.test.tsx`: similar for cells.
- README / CHANGELOG:
  - Document `experimentalMemoization` as experimental, list the constraints (user function props must be stable refs; custom cells reading `row.getIsExpanded()` should migrate to `useIsExpanded` or `useRowState`).
  - Explicitly promise the default path is unchanged.
- Run `npm run typecheck` and `npm test` after each phase.
- Ships as a non-breaking minor release.

## Critical files

New:

- `src/components/BaseRow/BaseRow.memo.tsx`
- `src/components/BaseRow/RowStateContext.ts`
- `src/components/BaseCell/BaseCell.memo.tsx`
- `src/components/BaseDraggableRow/BaseDraggableRow.memo.tsx`
- `src/hooks/useRenderCount.ts` (dev-only)
- `src/components/Table/__stories__/stories/RenderCountTreeStory.tsx`
- tests under `__tests__/` per component

Touched (minimally):

- `src/components/BaseTable/BaseTable.tsx` — add prop + branch in `renderBodyRows`; default path unchanged.
- `src/components/Table/Table.tsx` — thread the prop through (type only; already spreads `...props`).
- `src/components/TreeExpandableCell/TreeExpandableCell.tsx` — replace `row.getIsExpanded()` with `useIsExpanded(row)` (backward compatible).
- `src/components/BaseGroupHeader/BaseGroupHeader.tsx` — same.
- `src/index.ts` — export `RowStateContext`, `useRowState`, `useIsExpanded`.

Untouched:

- `src/components/BaseRow/BaseRow.tsx`
- `src/components/BaseCell/BaseCell.tsx`
- `src/components/BaseDraggableRow/BaseDraggableRow.tsx`

## Existing utilities to reuse

- `ariaRowIndexMap` memoization at `BaseTable.tsx:170-172`.
- `cellClassName` / `rowClassName` `useCallback`/`useMemo` at `Table.tsx:43-97` — already stable.

## Verification

1. **Default path regression**: with `experimentalMemoization` omitted/false, React DevTools commit traces on existing stories (`TreeStory`, `VirtualizedTreeStory`, `TreeWithGroupsStory`, `ReorderingTreeStory`, `GroupingWithSelectionStory`) are identical to before (pixel snapshots + commit count unchanged).
2. **Opt-in path win**: same stories with `experimentalMemoization={true}` — toggling one row's expansion commits only that row + newly visible children; selection toggle commits only the toggled row; cell non-affected rows skip.
3. **Render-count story**: `RenderCountTreeStory` with 1000 rows shows <10 row commits per expand-toggle in memo mode vs N in legacy mode.
4. Jest: `npm test` — both modes pass.
5. Typecheck: `npm run typecheck` — clean.
6. Smoke: `npm start` and exercise each story manually in both modes.

## Risks

- **Unstable user callbacks defeat memo.** Inline `(row) => ({...})` for `attributes`/`cellAttributes`/`className` — perf win only if user provides stable refs. Document.
- **User cells reading `row.getIsExpanded()` directly** won't auto-update when memoized `BaseCell` is active. Mitigation: `useIsExpanded` / `useRowState` hooks provided; migration is one-line and works in both modes.
- **`SortableListContext` value identity** may cause its consumers to re-render unnecessarily even with memo. If profiling Phase 3 shows this, stabilize the provider value with `useMemo` — separate small task.
- **API stability**: `experimentalMemoization`, `RowStateContext`, `useRowState`, `useIsExpanded` are all marked experimental; reserve the right to rename/remove before stabilization. Consumers opt in knowingly.
