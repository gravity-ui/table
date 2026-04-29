# Remove RowStateContext Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `row.getIsExpanded()` / `row.getIsSelected()` work correctly inside any cell render function under `experimentalMemoization` — no library hooks needed — by threading row state into `MemoBaseCell`'s comparator and deleting `RowStateContext` entirely.

**Architecture:** Add optional internal props `isExpanded` / `isSelected` to `BaseCellProps`; destructure-and-discard them in `BaseCell`; add them to `areCellPropsEqual` so `MemoBaseCell` re-renders when row state changes. `BaseRow` passes these values to all `Cell` call sites. Remove `RowStateContext.Provider` from `BaseRow` and delete the context file. `TreeExpandableCell` switches from `useIsExpanded(row)` to `row.getIsExpanded()` directly.

**Tech Stack:** TypeScript, React 18, `@gravity-ui/table` (this repo), `@tanstack/react-table`.

---

## Pre-flight context

Spec: [`docs/superpowers/specs/2026-04-29-remove-row-state-context.md`](../specs/2026-04-29-remove-row-state-context.md).

Current state (all verified):

- `BaseCellProps` in `src/components/BaseCell/BaseCell.tsx:9-16` — no `isExpanded`/`isSelected` props yet.
- `areCellPropsEqual` in `src/components/BaseCell/BaseCell.memo.tsx:6-16` — compares `cell`, `className`, `attributes`, `style`, `children`, `colSpan`, `aria-colindex`; no row state.
- `BaseRow` in `src/components/BaseRow/BaseRow.tsx:163-190` — wraps output in `<RowStateContext.Provider value={rowState}>`. Has `Cell` calls at lines 123 (group header) and 152-159 (regular cells).
- `TreeExpandableCell` in `src/components/TreeExpandableCell/TreeExpandableCell.tsx:14` — calls `useIsExpanded(row)`.
- `src/index.ts:55-62` — exports `MemoBaseRow`, `MemoBaseCell`, `MemoBaseDraggableRow`, `RowStateContext`, `useRowState`, `useIsExpanded` as a group.

## File map

### Modified

- `src/components/BaseCell/BaseCell.tsx` — add `isExpanded?` / `isSelected?` to interface; destructure + discard in component body
- `src/components/BaseCell/BaseCell.memo.tsx` — add `isExpanded` / `isSelected` to `areCellPropsEqual`
- `src/components/BaseRow/BaseRow.tsx` — pass `isExpanded` / `isSelected` to all `Cell` calls; remove `RowStateContext.Provider` and `rowState` useMemo
- `src/components/TreeExpandableCell/TreeExpandableCell.tsx` — replace `useIsExpanded(row)` with `row.getIsExpanded()`; remove import
- `src/index.ts` — remove `RowStateContext`, `useRowState`, `useIsExpanded` from export block
- `docs/MIGRATION-experimentalMemoization.md` — remove "Building your own analogue" sub-section; update anti-pattern #3 and the "What memoization does not fix" bullet

### Deleted

- `src/components/BaseRow/RowStateContext.ts`

### Untouched

- `src/components/BaseRow/BaseRow.memo.tsx` — already correct; no changes needed

---

## Task 1: Add `isExpanded`/`isSelected` to `BaseCellProps` and `areCellPropsEqual`

**Files:**

- Modify: `src/components/BaseCell/BaseCell.tsx`
- Modify: `src/components/BaseCell/BaseCell.memo.tsx`

- [ ] **Step 1: Add `isExpanded` and `isSelected` to `BaseCellProps` interface**

In `src/components/BaseCell/BaseCell.tsx`, replace the interface (lines 9-16):

```ts
export interface BaseCellProps<TData>
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'className'> {
  cell?: Cell<TData, unknown>;
  className?: string | ((cell?: Cell<TData, unknown>) => string);
  attributes?:
    | React.TdHTMLAttributes<HTMLTableCellElement>
    | ((cell?: Cell<TData, unknown>) => React.TdHTMLAttributes<HTMLTableCellElement>);
  /** @internal Used by MemoBaseCell comparator. Discarded in render. */
  isExpanded?: boolean;
  /** @internal Used by MemoBaseCell comparator. Discarded in render. */
  isSelected?: boolean;
}
```

- [ ] **Step 2: Destructure and discard `isExpanded`/`isSelected` in `BaseCell`**

In `src/components/BaseCell/BaseCell.tsx`, replace the component destructure (lines 18-25):

```tsx
export const BaseCell = <TData,>({
    cell,
    children,
    className: classNameProp,
    style,
    attributes: attributesProp,
    isExpanded: _isExpanded,
    isSelected: _isSelected,
    ...restProps
}: BaseCellProps<TData>) => {
```

The underscore-prefixed variables are intentionally unused — they exist only to prevent the props from landing in `restProps` and being spread onto `<td>`.

- [ ] **Step 3: Add `isExpanded`/`isSelected` to `areCellPropsEqual`**

In `src/components/BaseCell/BaseCell.memo.tsx`, replace the entire `areCellPropsEqual` function (lines 6-16):

```ts
function areCellPropsEqual<TData>(prev: BaseCellProps<TData>, next: BaseCellProps<TData>): boolean {
  return (
    prev.isExpanded === next.isExpanded &&
    prev.isSelected === next.isSelected &&
    prev.cell === next.cell &&
    prev.className === next.className &&
    prev.attributes === next.attributes &&
    prev.style === next.style &&
    prev.children === next.children &&
    prev.colSpan === next.colSpan &&
    prev['aria-colindex'] === next['aria-colindex']
  );
}
```

- [ ] **Step 4: Run typecheck**

```bash
cd /home/chelentos/table && npx tsc --noEmit 2>&1 | tail -20
```

Expected: no errors. If errors appear, fix them before continuing.

- [ ] **Step 5: Commit**

```bash
cd /home/chelentos/table && git add src/components/BaseCell/BaseCell.tsx src/components/BaseCell/BaseCell.memo.tsx
git commit -m "$(cat <<'EOF'
feat(BaseCell): add isExpanded/isSelected to MemoBaseCell comparator

Thread row state into areCellPropsEqual so MemoBaseCell re-renders
when expansion or selection changes. Consumers can now call
row.getIsExpanded() directly in any cell render function under
experimentalMemoization without useIsExpanded.
EOF
)"
```

---

## Task 2: Thread `isExpanded`/`isSelected` through `BaseRow` and remove `RowStateContext`

**Files:**

- Modify: `src/components/BaseRow/BaseRow.tsx`
- Delete: `src/components/BaseRow/RowStateContext.ts`

- [ ] **Step 1: Remove `rowState` useMemo and `RowStateContext.Provider` from `BaseRow`**

In `src/components/BaseRow/BaseRow.tsx`:

**Remove** the import at line 13:

```ts
import {RowStateContext} from './RowStateContext';
```

**Remove** the `rowState` useMemo block (lines 90-93):

```ts
const rowState = React.useMemo(
  () => ({isSelected, isExpanded, depth: row.depth}),
  [isSelected, isExpanded, row.depth],
);
```

**Replace** the JSX return (lines 163-191) — remove the `RowStateContext.Provider` wrapper, keeping only the `<tr>`:

```tsx
return (
  <tr
    ref={rowRef}
    className={b(
      'row',
      {
        selected: isSelected,
        interactive: Boolean(onClick),
      },
      className,
    )}
    onClick={handleClick}
    data-index={virtualItem?.index}
    {...restProps}
    {...attributes}
    style={{
      top:
        rowVirtualizer && virtualItem
          ? virtualItem.start - rowVirtualizer.options.scrollMargin
          : undefined,
      ...style,
      ...attributes?.style,
    }}
  >
    {renderRowContent()}
  </tr>
);
```

- [ ] **Step 2: Pass `isExpanded`/`isSelected` to all `Cell` call sites inside `renderRowContent`**

In the `renderRowContent` function inside `src/components/BaseRow/BaseRow.tsx`, update every `<Cell` JSX element to receive `isExpanded` and `isSelected`.

**Group header cell** (currently around line 123-128):

```tsx
<Cell
    className={cellClassName}
    colSpan={row.getVisibleCells().length}
    attributes={cellAttributes}
    aria-colindex={1}
    isExpanded={isExpanded}
    isSelected={isSelected}
>
```

**Regular cells** (currently around lines 152-159):

```tsx
return row
  .getVisibleCells()
  .map((cell) => (
    <Cell
      key={cell.id}
      cell={cell}
      className={cellClassName}
      attributes={cellAttributes}
      aria-colindex={cell.column.getIndex() + 1}
      isExpanded={isExpanded}
      isSelected={isSelected}
    />
  ));
```

Note: The `renderCustomRowContent` call at line 147 passes `Cell: BaseCell` directly to the consumer — leave that line unchanged, it is not affected by this change.

- [ ] **Step 3: Delete `RowStateContext.ts`**

```bash
rm /home/chelentos/table/src/components/BaseRow/RowStateContext.ts
```

- [ ] **Step 4: Check for stale imports**

```bash
cd /home/chelentos/table && grep -rn "RowStateContext\|useRowState\|useIsExpanded" src/ | grep -v "index.ts"
```

Expected: no output. Every remaining reference should be only in the exports cleanup (Task 3). If anything shows up, fix the dangling import.

- [ ] **Step 5: Run typecheck**

```bash
cd /home/chelentos/table && npx tsc --noEmit 2>&1 | tail -20
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
cd /home/chelentos/table && git add src/components/BaseRow/BaseRow.tsx src/components/BaseRow/RowStateContext.ts
git commit -m "$(cat <<'EOF'
refactor(BaseRow): remove RowStateContext; thread row state as props

Pass isExpanded/isSelected to all Cell call sites so MemoBaseCell's
comparator can detect row state changes without a context subscription.
Delete RowStateContext.ts — the context mechanism is no longer needed.
EOF
)"
```

---

## Task 3: Simplify `TreeExpandableCell` and clean up `src/index.ts`

**Files:**

- Modify: `src/components/TreeExpandableCell/TreeExpandableCell.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Replace `useIsExpanded(row)` with `row.getIsExpanded()` in `TreeExpandableCell`**

In `src/components/TreeExpandableCell/TreeExpandableCell.tsx`, replace the file content entirely:

```tsx
import * as React from 'react';

import {ArrowToggle, Button, Flex} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

import {b} from '../Table/Table.classname';

export interface TreeExpandableCellProps<TData> extends React.PropsWithChildren {
  row: Row<TData>;
}

export const TreeExpandableCell = <TData,>({row, children}: TreeExpandableCellProps<TData>) => {
  const isExpanded = row.getIsExpanded();
  return (
    <Flex>
      <Button
        className={b('expanding-control', {visible: row.getCanExpand()})}
        view="flat"
        size="s"
        onClick={row.getToggleExpandedHandler()}
      >
        <Button.Icon>
          <ArrowToggle direction={isExpanded ? 'bottom' : 'right'} size={16} />
        </Button.Icon>
      </Button>
      {children}
    </Flex>
  );
};
```

The only changes vs. the current file: removed `import {useIsExpanded} from '../BaseRow/RowStateContext'` and replaced `useIsExpanded(row)` with `row.getIsExpanded()`.

- [ ] **Step 2: Remove `RowStateContext`, `useRowState`, `useIsExpanded` from `src/index.ts`**

In `src/index.ts`, replace the export block at lines 55-62:

```ts
export {
  MemoBaseRow,
  MemoBaseCell,
  MemoBaseDraggableRow,
  RowStateContext,
  useRowState,
  useIsExpanded,
} from './components';
```

with:

```ts
export {MemoBaseRow, MemoBaseCell, MemoBaseDraggableRow} from './components';
```

- [ ] **Step 3: Verify no remaining references**

```bash
cd /home/chelentos/table && grep -rn "RowStateContext\|useRowState\|useIsExpanded" src/
```

Expected: no output at all. If anything matches, it's a missed import or export — fix it.

- [ ] **Step 4: Run typecheck**

```bash
cd /home/chelentos/table && npx tsc --noEmit 2>&1 | tail -20
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
cd /home/chelentos/table && git add src/components/TreeExpandableCell/TreeExpandableCell.tsx src/index.ts
git commit -m "$(cat <<'EOF'
refactor(TreeExpandableCell): use row.getIsExpanded() directly

Now that MemoBaseCell re-renders on isExpanded changes, TreeExpandableCell
no longer needs useIsExpanded. Remove RowStateContext/useRowState/useIsExpanded
from public exports — none of these were ever released.
EOF
)"
```

---

## Task 4: Update migration doc

**Files:**

- Modify: `docs/MIGRATION-experimentalMemoization.md`

- [ ] **Step 1: Read the current doc to confirm exact text**

```bash
grep -n "Building your own\|Do not call\|useIsExpanded\|RowStateContext\|memoized render path" /home/chelentos/table/docs/MIGRATION-experimentalMemoization.md
```

Note the line numbers of: (a) the "What memoization can and can't fix" bullet mentioning `useIsExpanded`, (b) the "Building your own analogue (advanced)" heading and its body.

- [ ] **Step 2: Remove the "Building your own analogue" sub-section**

Delete the entire `#### Building your own analogue (advanced)` sub-section from anti-pattern #3 — from that heading through the closing `**Do not** call...` warning paragraph (inclusive). The section to delete currently reads:

````
#### Building your own analogue (advanced)

If `TreeExpandableCell`'s default chevron styling doesn't fit your design and
you need a custom row-state-aware component, import `useIsExpanded(row)`. It
subscribes to the same `RowStateContext` that `TreeExpandableCell` uses
internally — without it, `row.getIsExpanded()` is not re-called after a memo skip,
because the cell render function never runs again, so the displayed value goes stale:

```tsx
import type {Row} from '@tanstack/react-table';
import {useIsExpanded} from '@gravity-ui/table';

const MyChevron = ({row}: {row: Row<Item>}) => {
  const expanded = useIsExpanded(row); // memo-safe; stays in sync after toggles
  return <CustomIcon direction={expanded ? 'down' : 'right'} />;
};
````

**Do not** call `row.getIsExpanded()` directly inside a cell render fn under
`experimentalMemoization` — `MemoBaseRow` skips re-rendering on row state
changes, so the displayed value goes stale after a toggle.

```

Replace that removed block with a short note that `row.getIsExpanded()` also works for custom chevrons:

```

If you need a custom chevron, call `row.getIsExpanded()` directly — it works
correctly under `experimentalMemoization`:

```tsx
cell: (info) => (
  <span>
    <button onClick={info.row.getToggleExpandedHandler()}>
      {info.row.getIsExpanded() ? '▼' : '▶'}
    </button>
    {info.getValue<string>()}
  </span>
),
```

```

- [ ] **Step 3: Update the "encapsulates the chevron button + the row-state subscription" phrase**

In anti-pattern #3's opening paragraph (just above the `TreeExpandableCell` code example), find:

```

For tree expansion, **use `TreeExpandableCell` from the library**. It encapsulates
the chevron button + the row-state subscription in one component:

```

Replace with:

```

For tree expansion, **use `TreeExpandableCell` from the library**. It encapsulates
the chevron button and toggle handler in one component:

````

- [ ] **Step 4: Update the "What memoization can and can't fix" bullet**

Near the top of the file, find the bullet that reads:

> Cells call `row.getIsExpanded()` / `row.getIsSelected()` directly inside a memoized render path. Use `TreeExpandableCell` for tree chevrons, or `useIsExpanded(row)` for custom row-state-aware components — see anti-pattern #3.

Replace it with:

> Cells call `row.getIsExpanded()` / `row.getIsSelected()` directly inside a memoized render path — both work correctly. Use `TreeExpandableCell` for a ready-made chevron, or call `row.getIsExpanded()` directly in a custom cell — see anti-pattern #3.

- [ ] **Step 5: Run prettier**

```bash
cd /home/chelentos/table && npx prettier --write docs/MIGRATION-experimentalMemoization.md
````

Expected: file written with consistent formatting, no errors.

- [ ] **Step 6: Verify no remaining `useIsExpanded` mentions in the doc**

```bash
grep -n "useIsExpanded\|RowStateContext\|useRowState\|Building your own" /home/chelentos/table/docs/MIGRATION-experimentalMemoization.md
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
cd /home/chelentos/table && git add docs/MIGRATION-experimentalMemoization.md
git commit -m "$(cat <<'EOF'
docs(migration): row.getIsExpanded() works directly under memoization

Remove the useIsExpanded 'Building your own analogue' sub-section.
row.getIsExpanded() now works correctly in any cell render fn under
experimentalMemoization. Update the anti-pattern #3 note and the
'What memoization does not fix' bullet accordingly.
EOF
)"
```

---

## Final verification

After all four tasks:

```bash
cd /home/chelentos/table && grep -rn "RowStateContext\|useRowState\|useIsExpanded" src/ docs/
```

Expected: no output.

```bash
cd /home/chelentos/table && npx tsc --noEmit
```

Expected: clean.
