# Remove RowStateContext — Pure TanStack API for Row State

**Date:** 2026-04-29

## Goal

Make `row.getIsExpanded()` and `row.getIsSelected()` work correctly inside any cell render function under `experimentalMemoization`, without consumers needing to import `useIsExpanded`, `useRowState`, or any library-specific hook. Delete `RowStateContext`, `useRowState`, and `useIsExpanded` entirely.

## Background

`experimentalMemoization` wraps rows in `MemoBaseRow` (which skips re-rendering when `isExpanded` / `isSelected` are unchanged) and wraps cells in `MemoBaseCell` (which skips re-rendering when `cell`, `className`, `attributes`, and a few other props are referentially unchanged).

The problem: TanStack keeps `cell` object references stable across renders when only row state changes. So `MemoBaseCell.areCellPropsEqual` returns `true`, cells skip their re-render, and `row.getIsExpanded()` inside the cell fn returns a stale value.

The current fix is `RowStateContext` — `BaseRow` provides `{isSelected, isExpanded, depth}` via context, and `TreeExpandableCell` subscribes via `useIsExpanded(row)` to force its re-render. This requires consumers to use library-specific hooks.

## Design

### Core change: `isExpanded` + `isSelected` in `MemoBaseCell`'s comparator

`MemoBaseRow` already receives `isExpanded` and `isSelected` as explicit props (required for its own `areEqual` to detect the change). Thread these same values down to each `MemoBaseCell` call inside `BaseRow`. Add them to `areCellPropsEqual`:

```ts
function areCellPropsEqual(prev, next) {
    return (
        prev.isExpanded === next.isExpanded &&
        prev.isSelected === next.isSelected &&
        prev.cell === next.cell &&
        // ... existing checks unchanged
    );
}
```

When expansion or selection toggles:

1. `MemoBaseRow.areEqual` fails → row re-renders.
2. `BaseRow` passes new `isExpanded`/`isSelected` to each `MemoBaseCell`.
3. `areCellPropsEqual` fails for every cell → cells re-render.
4. `flexRender` reruns the consumer's cell fn → `row.getIsExpanded()` returns a fresh value.

**Re-render scope:** All cells in the toggled row re-render (was: only cells subscribed to `RowStateContext`). Cross-row isolation is unchanged — other rows are not affected. This scope is acceptable.

### `isExpanded` / `isSelected` are internal props on `MemoBaseCell`

These two props are added to `BaseCellProps` as optional, `@internal`-tagged fields. `BaseCell` explicitly destructures and discards them (they must not be spread onto `<td>`). `areCellPropsEqual` reads them. `BaseRow` passes them in all `Cell` call sites: the regular cell loop (`row.getVisibleCells()`), the group header cell, and any other internal `Cell` renders.

### `RowStateContext` is removed

`BaseRow` no longer wraps its output in `<RowStateContext.Provider>`. The file `src/components/BaseRow/RowStateContext.ts` is deleted.

`BaseRow.tsx` imports of `RowStateContext` are removed. The `isSelected` and `isExpanded` props on `BaseRowProps` keep their current purpose (overriding `row.getIsExpanded()` / `row.getIsSelected()` for the selected CSS modifier) — no semantic change there, only the context provider goes away.

### `TreeExpandableCell` uses `row.getIsExpanded()` directly

The only internal consumer of `useIsExpanded` is `TreeExpandableCell`. Replace:

```tsx
const isExpanded = useIsExpanded(row);
```

with:

```tsx
const isExpanded = row.getIsExpanded();
```

This works correctly because `MemoBaseCell` now re-renders the cell when `isExpanded` changes. `TreeExpandableCell`'s public API is unchanged.

### Exports removed from `src/index.ts`

- `RowStateContext`
- `useRowState`
- `useIsExpanded`

These were never in a released version, so no semver concern.

### Migration doc updated

Remove the "Building your own analogue (advanced)" sub-section from anti-pattern #3 (it existed solely to document `useIsExpanded`). Anti-pattern #3 becomes simply: use `TreeExpandableCell`, or call `row.getIsExpanded()` directly — both work.

## File map

### Modified

- `src/components/BaseCell/BaseCell.tsx` — add optional `isExpanded?: boolean`, `isSelected?: boolean` props (internal, discarded in render)
- `src/components/BaseCell/BaseCell.memo.tsx` — add `isExpanded` and `isSelected` to `areCellPropsEqual`
- `src/components/BaseRow/BaseRow.tsx` — pass `isExpanded`/`isSelected` to each `Cell` call; remove `RowStateContext.Provider` and its import
- `src/components/TreeExpandableCell/TreeExpandableCell.tsx` — replace `useIsExpanded(row)` with `row.getIsExpanded()`; remove `RowStateContext` import
- `src/index.ts` — remove exports of `RowStateContext`, `useRowState`, `useIsExpanded`
- `docs/MIGRATION-experimentalMemoization.md` — remove "Building your own analogue" sub-section; simplify anti-pattern #3

### Deleted

- `src/components/BaseRow/RowStateContext.ts`

### Untouched

- `src/components/BaseRow/BaseRow.memo.tsx` — `MemoBaseRow` already compares `isExpanded`/`isSelected`; no change needed
- `src/components/BaseCell/BaseCell.tsx` public render logic — `isExpanded`/`isSelected` are destructured and ignored
- `TreeExpandableCell` public API — `{row, children}` unchanged

## Verification

- TypeScript: `npx tsc --noEmit` — clean
- No remaining references to `RowStateContext`, `useRowState`, `useIsExpanded` anywhere in `src/`
- Storybook memoization story: toggle a row expansion, confirm chevron flips and no other rows re-render (React DevTools Profiler)
- `row.getIsExpanded()` called directly in a custom cell fn under `experimentalMemoization` produces the correct value after each toggle
