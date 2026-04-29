# Design: `getRowVersion` — universal row state snapshot for `experimentalMemoization`

## Summary

Replace the closed-world `isSelected` / `isExpanded` lifting inside `experimentalMemoization` with a single user-controlled prop, `getRowVersion(row)`, that returns an array of values to compare in the memoized row + cell comparators. Cells become standard TanStack code (no special hooks); users control exactly which row state slices participate in memoization.

## Problem

Today, `experimentalMemoization` lifts a fixed pair of state slices (`row.getIsSelected()`, `row.getIsExpanded()`) into explicit props so the comparator can detect changes despite TanStack's in-place row mutation. Anything outside that pair — `row.getIsPinned()`, `row.getCanSelect()`, custom external state keyed by row id — is silently broken: a custom cell that reads such state never re-renders when the state changes, because the comparator doesn't know about it and `prev.row === next.row` is always true under in-place mutation.

This forced the library into two bad choices: (a) ship an ever-growing list of "lifted" state slices and prop names, or (b) ship hooks like `useIsExpanded` / `useRowState` that force user cells off plain TanStack API. Neither is open-ended; both are leaky.

`getRowVersion` resolves it by letting the _user_ declare what state matters. The library snapshots whatever they declare and compares snapshots; cells stay pure TanStack.

## Public API

### One new prop on `BaseTableProps` (and therefore `TableProps`)

```ts
interface BaseTableProps<TData, TScrollElement> {
  experimentalMemoization?: boolean; // unchanged
  /**
   * EXPERIMENTAL. Snapshot of row state used by the memo comparator.
   * Only relevant when `experimentalMemoization` is true. Returned values
   * are compared element-wise via Object.is — anything your custom cells
   * read from the row (or external state keyed by row id) should appear here.
   *
   * Default: (row) => [row.getIsSelected(), row.getIsExpanded()]
   */
  getRowVersion?: (row: Row<TData>) => readonly unknown[];
}
```

When `experimentalMemoization` is `false` (default), `getRowVersion` is ignored. The non-memoized path is byte-for-byte unchanged.

### Usage

Default (covers selection + expansion):

```tsx
<Table table={table} experimentalMemoization />
```

Custom — user reads `row.getIsPinned()` in a cell:

```tsx
const getRowVersion = (row: Row<MyData>) =>
  [row.getIsSelected(), row.getIsExpanded(), row.getIsPinned()] as const;

<Table table={table} experimentalMemoization getRowVersion={getRowVersion} />;
```

Custom — external state not on the row:

```tsx
const highlightedIds = useHighlightedRowIds(); // Set<string>

const getRowVersion = React.useCallback(
  (row: Row<MyData>) =>
    [row.getIsSelected(), row.getIsExpanded(), highlightedIds.has(row.id)] as const,
  [highlightedIds],
);
```

When `highlightedIds` changes, the version array changes only for affected rows; only those rows re-render.

### Removed (no deprecation period — `experimentalMemoization` is explicitly experimental)

- `isSelected` and `isExpanded` props on `BaseRowProps` (added solely for memoization, no longer needed).
- `isSelected` and `isExpanded` props on `MemoBaseRowProps` and `MemoBaseDraggableRowProps`.
- `isSelected` and `isExpanded` props on `BaseCellProps` (`@internal` markers used only by the `MemoBaseCell` comparator).
- The placeholder hooks/context referenced in the original migration doc — `useIsExpanded`, `useRowState`, `RowStateContext`. **Note:** these were planned in `docs/MIGRATION-experimentalMemoization.md` but never extracted as separate files; nothing exists in the source tree to remove. The migration doc just stops mentioning them.

### Kept

- `experimentalMemoization` flag, semantics unchanged.
- `MemoBaseRow`, `MemoBaseCell`, `MemoBaseDraggableRow` exports.
- `MemoBaseRowProps`, `MemoBaseDraggableRowProps` types — minus the two removed props above.
- `BaseRow`, `BaseCell`, `BaseDraggableRow` (the non-memoized default path), unchanged behavior.

## Architecture

### Internal state propagation

`BaseTable.renderBodyRows` is the single point that decides between the memoized and non-memoized paths. It already branches on `experimentalMemoization` at `BaseTable.tsx:300`. The change is:

1. Compute `rowVersion` per row by calling `getRowVersion(row)` (or the default if not provided).
2. Pass it down to `MemoBaseRow` / `MemoBaseDraggableRow` as a single `_rowVersion` prop (`@internal`).
3. `MemoBaseRow` propagates `_rowVersion` to each `MemoBaseCell` it renders, so cell-level comparators short-circuit consistently with their row.

Cells receive only one new prop, `_rowVersion`, which is discarded in render and consumed only by the comparator.

### Comparators

`MemoBaseRow.areEqual` change:

- **Removed:** `prev.isSelected === next.isSelected` and `prev.isExpanded === next.isExpanded`.
- **Added:** `arraysShallowEqual(prev._rowVersion, next._rowVersion)`.
- Everything else (`row`, `table`, `style`, `className`, `attributes`, function-prop refs, `virtualItem.start`/`size`, `aria-selected`) unchanged.

`MemoBaseCell.areEqual` change:

- **Removed:** `prev.isExpanded === next.isExpanded` and `prev.isSelected === next.isSelected`.
- **Added:** `arraysShallowEqual(prev._rowVersion, next._rowVersion)`.
- Everything else (`cell`, `className`, `attributes`, `style`, `children`, `colSpan`, `aria-colindex`) unchanged.

`arraysShallowEqual` — small helper colocated with the comparators:

```ts
function arraysShallowEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}
```

### `BaseRow.tsx` changes

- Drop `isSelected?: boolean` and `isExpanded?: boolean` from `BaseRowProps`.
- Drop the `isSelectedProp ?? row.getIsSelected()` / `isExpandedProp ?? row.getIsExpanded()` fallbacks.
- Body of the component reads `row.getIsSelected()` / `row.getIsExpanded()` inline at the call sites that consume them (className, group-header `Cell` props at lines 121-122, regular `Cell` props at lines 154-155).
- The `Cell` instances inside `BaseRow` keep the `isExpanded` / `isSelected` props _structurally_ until `BaseCellProps` is updated (next step) — see `BaseCell.tsx` changes below.

### `BaseCell.tsx` changes

- Remove `isExpanded?: boolean` and `isSelected?: boolean` from `BaseCellProps`.
- Remove the destructured-and-discarded `_isExpanded` / `_isSelected` from the component body (lines 28-29).
- Add `_rowVersion?: readonly unknown[]` as `@internal` on `BaseCellProps`. The plain `BaseCell` ignores it; `MemoBaseCell`'s comparator reads it.

### `BaseRow.memo.tsx` changes

- `MemoBaseRowProps` extends `BaseRowProps` and adds one new field: `_rowVersion: readonly unknown[]` (`@internal`, required — `BaseTable` always supplies it in the memoization path). The previously-required `isSelected` / `isExpanded` overrides go away with `BaseRowProps`'s removal of those fields.
- Comparator updated as described above.

### `BaseCell.memo.tsx` changes

- Comparator updated as described above.

### `BaseTable.tsx` changes

- Add `getRowVersion?: BaseTableProps['getRowVersion']` to the props.
- Inside `renderBodyRows`, when `experimentalMemoization` is true:
  - Resolve `getRowVersion` once outside the row loop: `const resolveRowVersion = getRowVersion ?? defaultGetRowVersion;`.
  - Per row, compute `const rowVersion = resolveRowVersion(row);`.
  - Drop the existing `isSelected` / `isExpanded` lift in `memoizedProps` (lines 307-312).
  - Pass `_rowVersion={rowVersion}` to `MemoBaseRow` / `MemoBaseDraggableRow`.

### `BaseDraggableRow.memo.tsx` changes

- Mirror `MemoBaseRow.memo.tsx` changes: drop the two state props, add `_rowVersion`.

### `Table.tsx`

- No code change needed — `Table` spreads its props into `BaseTable`. The new prop flows through.

### `index.ts`

- No change to which symbols are exported. The two removed prop pairs are interface-level changes on already-exported types.

## Migration

`experimentalMemoization` is documented as experimental — breaking changes within it are explicit and fair. The release notes call out:

- **Cells using only TanStack API (`row.getIsSelected()`, `row.getIsExpanded()`)** — no migration needed.
- **Cells using the planned-but-never-shipped `useIsExpanded` / `useRowState` hooks** — replace with direct `row.getIsExpanded()` / `row.getIsSelected()`. (In practice, no one uses these because they were never released as code, only described in docs.)
- **Cells reading row state outside selection/expansion** — pass `getRowVersion` listing what they read.
- **Code passing `isSelected` / `isExpanded` directly to `BaseRow` / `MemoBaseRow` / `BaseCell`** — drop those props; the components read state directly.

The migration doc at `docs/MIGRATION-experimentalMemoization.md` is rewritten to reflect this. The reference to a planned anti-patterns Storybook story is removed.

## Documentation

### `docs/MIGRATION-experimentalMemoization.md` rewrite

Sections retained (relevant):

- "What memoization can and can't fix" (intro).
- Anti-pattern checklist items 1 (unstable callbacks), 2 (custom contexts read by cells), 4 (fresh `state` object) — all still apply.
- Verification recipe (React DevTools profiler).
- QuotasTable3 worked example (updated to drop the `useIsExpanded` discussion since cells now use `row.getIsExpanded()` directly — which they already did in that example).

Sections removed:

- Item 3's "use `useIsExpanded`" guidance — replaced with a note that cells use TanStack API directly and any state slice they read should be added to `getRowVersion`.
- Reference to the "Experimental: Anti-patterns that defeat memoization" Storybook story (no such story file exists; the reference is dropped).

New section: **"Tell the library what state your cells read"**, with `getRowVersion` examples covering the three cases above (default, extended row state, external state).

### README addition

Add a top-level "Memoization (experimental)" section to `README.md` with:

- A one-paragraph summary of what `experimentalMemoization` does and when to use it.
- The two-line "default" example.
- The `getRowVersion` example with `row.getIsPinned()`.
- A pointer to the migration doc for full anti-pattern guidance.

This is the user's primary discovery surface; the migration doc is for the deeper detail.

## Tests

Existing test files:

- `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx`
- `src/components/BaseCell/__tests__/BaseCell.memo.test.tsx` (if present; the original plan called for it)

Updates:

- Drop assertions on `isSelected` / `isExpanded` props.
- Add tests:
  - Default `getRowVersion`: toggling selection re-renders only the toggled row; toggling expansion re-renders the toggled row + newly visible children.
  - Custom `getRowVersion` including a third state slice (e.g. a synthetic flag): flipping that slice for one row re-renders only that row; the comparator skips on equal arrays.
  - `getRowVersion` returning a different-length array between renders (still compared correctly via `arraysShallowEqual`).
  - Cells receive consistent `_rowVersion`: when row re-renders due to version change, cells re-render too; when only e.g. `attributes` reference changes, cells comparator still bails out correctly.

No new Storybook stories. (`RenderCountTreeStory` continues to validate the default path; no `RowVersionStory` and no anti-patterns story.)

## Verification

1. **Default-path regression:** with `experimentalMemoization` omitted, snapshot tests on `TreeStory`, `VirtualizedTreeStory`, `TreeWithGroupsStory`, `ReorderingTreeStory`, `GroupingWithSelectionStory` are identical (commit count + DOM unchanged).
2. **Default opt-in path:** `experimentalMemoization=true` with no `getRowVersion`. Toggling expansion in `RenderCountTreeStory` re-renders only the toggled row + newly visible children. Selection toggles re-render only the toggled row.
3. **Custom `getRowVersion`:** add a temporary local story or test fixture using `[row.getIsSelected(), row.getIsExpanded(), row.getIsPinned()]`. Toggle row pinning programmatically; only pinned/unpinned row's cells re-render; other rows skip.
4. **Type compatibility:** consumers that previously passed `isSelected` / `isExpanded` directly to `BaseRow` / `MemoBaseRow` / `BaseCell` get a clear TS error pointing them to `getRowVersion`.
5. `npm run typecheck` clean.
6. `npm test` clean.
7. Manual smoke test of every story in both modes.

## Risks

- **`getRowVersion` instability.** If a user inlines the function and its closure captures something unstable, the function reference changes per render but its _output_ is what matters — and the output is computed fresh per row each render anyway. So the function reference being unstable is fine; only the returned values matter. Document this so users don't `useCallback` reflexively (it's not wrong, just not necessary unless they're closing over external state and want a stable handler for unrelated reasons).
- **Length change in returned array.** `arraysShallowEqual` handles different lengths correctly (returns `false`), so `getRowVersion` returning conditional state slices works. Documented as supported.
- **Breaking change for any consumer that passed `isSelected` / `isExpanded` directly to `BaseRow` / `MemoBaseRow` / `BaseCell`.** Mitigated by: (a) the props were added recently as part of `experimentalMemoization`, (b) the flag is explicitly experimental, (c) the TS error at the call site is clear and the migration is mechanical.
- **Out of scope: `getCellVersion` for column-level state.** Column pinning, sizing, etc. affect cell styles via `getCellStyles` (which reads `cell.column.getIsPinned()` directly each render). TanStack rebuilds cell references when column state changes (the row model is recomputed), so `prev.cell === next.cell` already false-detects column state changes correctly. If real-world usage surfaces a case where this isn't true, a symmetric `getCellVersion` prop can be added later as a non-breaking addition.

## Critical files

Touched:

- `src/components/BaseTable/BaseTable.tsx` — add prop, change `renderBodyRows` memoized branch.
- `src/components/BaseRow/BaseRow.tsx` — drop `isSelected` / `isExpanded` props; inline reads.
- `src/components/BaseRow/BaseRow.memo.tsx` — comparator + `_rowVersion`.
- `src/components/BaseCell/BaseCell.tsx` — drop `isSelected` / `isExpanded`; add `_rowVersion`.
- `src/components/BaseCell/BaseCell.memo.tsx` — comparator + `_rowVersion`.
- `src/components/BaseDraggableRow/BaseDraggableRow.memo.tsx` — comparator + `_rowVersion`.
- `src/components/Table/Table.tsx` — type only (already spreads props).
- `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx` — assertions update.
- `docs/MIGRATION-experimentalMemoization.md` — rewrite per Documentation section.
- `README.md` — add Memoization section.

Untouched:

- `src/components/TreeExpandableCell/TreeExpandableCell.tsx` (already calls `row.getIsExpanded()` directly).
- `src/components/BaseGroupHeader/BaseGroupHeader.tsx` (already calls `row.getIsExpanded()` directly).
- `src/index.ts` (no symbol changes).

No new files.
