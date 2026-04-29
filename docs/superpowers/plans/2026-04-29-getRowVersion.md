# `getRowVersion` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the closed-world `isSelected` / `isExpanded` lifting inside `experimentalMemoization` with a single user-controlled prop, `getRowVersion(row)`, that returns an array of state values to compare in the memoized row + cell comparators.

**Architecture:** A new optional `getRowVersion?: (row) => readonly unknown[]` on `BaseTableProps` defines what row state participates in memoization. `BaseTable` calls it once per row, passes the result down as an `@internal` `_rowVersion` prop to `MemoBaseRow` / `MemoBaseDraggableRow` / `MemoBaseCell`, and the comparators short-circuit on `arraysShallowEqual(prev._rowVersion, next._rowVersion)`. The old `isSelected` / `isExpanded` props on `BaseRowProps`, `MemoBaseRowProps`, `MemoBaseDraggableRowProps`, and `BaseCellProps` are removed without deprecation (the flag is explicitly experimental).

**Tech Stack:** TypeScript, React 18, `@tanstack/react-table` v8, Jest + `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-04-29-getRowVersion-design.md`.

---

## File Map

**Created:**

- `src/utils/arraysShallowEqual.ts` — element-wise array comparison helper used by both row and cell comparators.
- `src/utils/__tests__/arraysShallowEqual.test.ts` — unit tests for the helper.

**Modified:**

- `src/utils/index.ts` — re-export the new helper.
- `src/components/BaseTable/BaseTable.tsx` — add `getRowVersion` prop, compute `rowVersion` per row, pass it as `_rowVersion`, drop the existing `isSelected` / `isExpanded` lift in the memoized branch.
- `src/components/BaseRow/BaseRow.tsx` — drop `isSelected` / `isExpanded` from `BaseRowProps`; read `row.getIsSelected()` / `row.getIsExpanded()` inline at the consumption sites; add `_rowVersion?` to `BaseRowProps`; pass `_rowVersion` through to each `Cell` call site.
- `src/components/BaseRow/BaseRow.memo.tsx` — drop the two `isSelected` / `isExpanded` overrides on `MemoBaseRowProps`; add required `_rowVersion: readonly unknown[]`; replace the two prop checks in the comparator with `arraysShallowEqual(_rowVersion)`.
- `src/components/BaseCell/BaseCell.tsx` — drop `isSelected` / `isExpanded` from `BaseCellProps`; remove the `_isExpanded` / `_isSelected` discards in the component body; add `_rowVersion?: readonly unknown[]` (`@internal`).
- `src/components/BaseCell/BaseCell.memo.tsx` — replace the two prop checks in the comparator with `arraysShallowEqual(_rowVersion)`.
- `src/components/BaseDraggableRow/BaseDraggableRow.memo.tsx` — drop the two `isSelected` / `isExpanded` overrides on `MemoBaseDraggableRowProps`; add required `_rowVersion: readonly unknown[]`; replace the two prop checks in the comparator with `arraysShallowEqual(_rowVersion)`.
- `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx` — keep existing test, add new tests covering default `getRowVersion`, custom `getRowVersion`, and length changes.
- `docs/MIGRATION-experimentalMemoization.md` — rewrite per spec (drop `useIsExpanded` / anti-patterns-story references; add "Tell the library what state your cells read" section with `getRowVersion`).
- `README.md` — add a top-level "Memoization (experimental)" section.

**Untouched:** `src/components/Table/Table.tsx` (already spreads `...props` so the new prop flows through), `src/index.ts` (no symbol changes), `src/components/TreeExpandableCell/TreeExpandableCell.tsx`, `src/components/BaseGroupHeader/BaseGroupHeader.tsx` (both already call `row.getIsExpanded()` directly).

---

## Task 1: Create `arraysShallowEqual` utility (TDD)

**Files:**

- Create: `src/utils/arraysShallowEqual.ts`
- Create: `src/utils/__tests__/arraysShallowEqual.test.ts`
- Modify: `src/utils/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/utils/__tests__/arraysShallowEqual.test.ts`:

```ts
import {arraysShallowEqual} from '../arraysShallowEqual';

describe('arraysShallowEqual', () => {
  it('returns true for the same reference', () => {
    const a = [1, 'x', null];
    expect(arraysShallowEqual(a, a)).toBe(true);
  });

  it('returns true for arrays with element-wise equal primitives', () => {
    expect(arraysShallowEqual([1, 'x', true], [1, 'x', true])).toBe(true);
  });

  it('returns false when lengths differ', () => {
    expect(arraysShallowEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(arraysShallowEqual([1, 2, 3], [1, 2])).toBe(false);
  });

  it('returns false when any element differs by Object.is', () => {
    expect(arraysShallowEqual([1, 'x', true], [1, 'x', false])).toBe(false);
  });

  it('uses Object.is, not ===, for NaN', () => {
    expect(arraysShallowEqual([NaN], [NaN])).toBe(true);
  });

  it('uses Object.is, not ===, for +0 / -0', () => {
    expect(arraysShallowEqual([0], [-0])).toBe(false);
  });

  it('returns true for two empty arrays', () => {
    expect(arraysShallowEqual([], [])).toBe(true);
  });

  it('compares object references, not deep contents', () => {
    const obj = {a: 1};
    expect(arraysShallowEqual([obj], [obj])).toBe(true);
    expect(arraysShallowEqual([{a: 1}], [{a: 1}])).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/utils/__tests__/arraysShallowEqual.test.ts
```

Expected: FAIL with `Cannot find module '../arraysShallowEqual'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/utils/arraysShallowEqual.ts`:

```ts
export function arraysShallowEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/utils/__tests__/arraysShallowEqual.test.ts
```

Expected: PASS, 8 tests.

- [ ] **Step 5: Re-export from utils barrel**

Add this line to `src/utils/index.ts` (alphabetical order, before `cn` or after — match existing ordering):

```ts
export * from './arraysShallowEqual';
```

- [ ] **Step 6: Verify typecheck and full test suite**

```bash
npm run typecheck
npm test
```

Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add src/utils/arraysShallowEqual.ts src/utils/__tests__/arraysShallowEqual.test.ts src/utils/index.ts
git commit -m "feat(utils): add arraysShallowEqual helper for memo comparators"
```

---

## Task 2: Add `getRowVersion` prop type to `BaseTableProps`

**Files:**

- Modify: `src/components/BaseTable/BaseTable.tsx:155-156`

This task adds the type only — it doesn't wire the prop through yet. That happens in Task 3.

- [ ] **Step 1: Add the prop to the interface**

Find this block in `src/components/BaseTable/BaseTable.tsx`:

```ts
    /** EXPERIMENTAL. Enables React.memo on rows and cells to avoid full-table re-renders */
    experimentalMemoization?: boolean;
}
```

Replace with:

```ts
    /** EXPERIMENTAL. Enables React.memo on rows and cells to avoid full-table re-renders */
    experimentalMemoization?: boolean;
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

- [ ] **Step 2: Verify the `Row` type is already imported**

Check the top of `src/components/BaseTable/BaseTable.tsx`. If `Row` is not in the imports from `@tanstack/react-table`, add it.

- [ ] **Step 3: Verify typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/BaseTable/BaseTable.tsx
git commit -m "feat(BaseTable): add getRowVersion prop type"
```

---

## Task 3: Replace `isSelected` / `isExpanded` with `_rowVersion` in `BaseCell` and `MemoBaseCell`

This task and Task 4 together perform the atomic mechanism swap. After Task 3, `BaseRow.tsx` will temporarily reference props that no longer exist on `BaseCellProps` — the project will not type-check until Task 4 finishes. Do them back-to-back.

**Files:**

- Modify: `src/components/BaseCell/BaseCell.tsx`
- Modify: `src/components/BaseCell/BaseCell.memo.tsx`

- [ ] **Step 1: Update `BaseCellProps` and `BaseCell` body**

Open `src/components/BaseCell/BaseCell.tsx`. Replace the entire file contents with:

```tsx
import type * as React from 'react';

import {flexRender} from '@tanstack/react-table';

import type {Cell} from '../../types/base';
import {getCellClassModes, getCellStyles} from '../../utils';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseCellProps<TData>
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'className'> {
  cell?: Cell<TData, unknown>;
  className?: string | ((cell?: Cell<TData, unknown>) => string);
  attributes?:
    | React.TdHTMLAttributes<HTMLTableCellElement>
    | ((cell?: Cell<TData, unknown>) => React.TdHTMLAttributes<HTMLTableCellElement>);
  /** @internal Snapshot of row state for the MemoBaseCell comparator. Discarded in render. */
  _rowVersion?: readonly unknown[];
}

export const BaseCell = <TData,>({
  cell,
  children,
  className: classNameProp,
  style,
  attributes: attributesProp,
  _rowVersion: _rowVersionDiscarded,
  ...restProps
}: BaseCellProps<TData>) => {
  const attributes = typeof attributesProp === 'function' ? attributesProp(cell) : attributesProp;
  const className = typeof classNameProp === 'function' ? classNameProp(cell) : classNameProp;

  return (
    <td
      className={b('cell', getCellClassModes(cell), className)}
      {...restProps}
      {...attributes}
      style={getCellStyles(cell, {...style, ...attributes?.style})}
    >
      {cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : children}
    </td>
  );
};
```

Key changes vs. original:

- Removed `isExpanded?: boolean;` and `isSelected?: boolean;` from `BaseCellProps`.
- Added `_rowVersion?: readonly unknown[];` (`@internal`).
- Removed the `isExpanded: _isExpanded,` and `isSelected: _isSelected,` destructured discards.
- Destructured `_rowVersion` so it does not leak into `restProps` and onto the DOM `<td>`.

- [ ] **Step 2: Update `MemoBaseCell` comparator**

Open `src/components/BaseCell/BaseCell.memo.tsx`. Replace the entire file contents with:

```tsx
import * as React from 'react';

import {arraysShallowEqual} from '../../utils';

import type {BaseCellProps} from './BaseCell';
import {BaseCell} from './BaseCell';

function areCellPropsEqual<TData>(prev: BaseCellProps<TData>, next: BaseCellProps<TData>): boolean {
  return (
    arraysShallowEqual(prev._rowVersion ?? [], next._rowVersion ?? []) &&
    prev.cell === next.cell &&
    prev.className === next.className &&
    prev.attributes === next.attributes &&
    prev.style === next.style &&
    prev.children === next.children &&
    prev.colSpan === next.colSpan &&
    prev['aria-colindex'] === next['aria-colindex']
  );
}

export const MemoBaseCell = React.memo(BaseCell, areCellPropsEqual) as typeof BaseCell;
```

Key changes vs. original:

- Removed the `prev.isExpanded === next.isExpanded` and `prev.isSelected === next.isSelected` checks.
- Added `arraysShallowEqual(prev._rowVersion ?? [], next._rowVersion ?? [])` as the first check.
- Defaulting both sides to `[]` means a `MemoBaseCell` rendered without `_rowVersion` (e.g. in some yet-to-be-touched call site) compares as equal on this axis — correct, since absence of `_rowVersion` means the caller is not driving cell-level memoization on row state.

- [ ] **Step 3: Skip typecheck — proceed to Task 4**

Do not run typecheck or commit yet. `BaseRow.tsx` still passes `isSelected`/`isExpanded` to its `Cell` instances; those props no longer exist on `BaseCellProps`, so typecheck will fail. Task 4 fixes this.

---

## Task 4: Replace `isSelected` / `isExpanded` with `_rowVersion` in `BaseRow`, `MemoBaseRow`, `MemoBaseDraggableRow`, and wire `BaseTable`

**Files:**

- Modify: `src/components/BaseRow/BaseRow.tsx`
- Modify: `src/components/BaseRow/BaseRow.memo.tsx`
- Modify: `src/components/BaseDraggableRow/BaseDraggableRow.memo.tsx`
- Modify: `src/components/BaseTable/BaseTable.tsx`

- [ ] **Step 1: Update `BaseRow.tsx`**

Open `src/components/BaseRow/BaseRow.tsx`.

In the `BaseRowProps` interface, remove these two property declarations (and the leading JSDoc comments):

```ts
    /** When provided, overrides row.getIsSelected() for the selected CSS modifier. Used by MemoBaseRow. */
    isSelected?: boolean;
    /** When provided, overrides row.getIsExpanded() and is passed to all Cell call sites. Used by MemoBaseRow. */
    isExpanded?: boolean;
```

Replace with:

```ts
    /** @internal Snapshot of row state for the memo comparators. Discarded in render. */
    _rowVersion?: readonly unknown[];
```

In the `BaseRow` forwardRef body, find the destructured props block (around lines 58-80) and remove:

```ts
            isSelected: isSelectedProp,
            isExpanded: isExpandedProp,
```

Add this new line in the destructured block (alongside the other discards like `table: _`):

```ts
            _rowVersion,
```

Find these two lines (around lines 85-86):

```ts
const isSelected = isSelectedProp ?? row.getIsSelected();
const isExpanded = isExpandedProp ?? row.getIsExpanded();
```

Replace with:

```ts
const isSelected = row.getIsSelected();
const isExpanded = row.getIsExpanded();
```

Find both `<Cell ... />` call sites in the `renderRowContent` function (one in the group-header branch, one in the regular-cell map at the end). They currently include:

```tsx
isExpanded = {isExpanded};
isSelected = {isSelected};
```

Replace those two lines (in **both** call sites) with:

```tsx
_rowVersion = {_rowVersion};
```

The local `isSelected` / `isExpanded` constants are still used for the `<tr>` className and remain in place.

- [ ] **Step 2: Update `BaseRow.memo.tsx`**

Open `src/components/BaseRow/BaseRow.memo.tsx`. Replace the entire file contents with:

```tsx
import * as React from 'react';

import {arraysShallowEqual} from '../../utils';
import {MemoBaseCell} from '../BaseCell/BaseCell.memo';

import type {BaseRowProps} from './BaseRow';
import {BaseRow} from './BaseRow';

export interface MemoBaseRowProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
  extends BaseRowProps<TData, TScrollElement> {
  /** @internal Snapshot of row state — required so the comparator can detect state changes. */
  _rowVersion: readonly unknown[];
}

// eslint-disable-next-line complexity
function areEqual<TData, TScrollElement extends Element | Window>(
  prev: Readonly<MemoBaseRowProps<TData, TScrollElement>>,
  next: Readonly<MemoBaseRowProps<TData, TScrollElement>>,
): boolean {
  return (
    prev.row === next.row &&
    arraysShallowEqual(prev._rowVersion, next._rowVersion) &&
    prev.table === next.table &&
    prev.virtualItem?.start === next.virtualItem?.start &&
    prev.virtualItem?.size === next.virtualItem?.size &&
    prev.style === next.style &&
    prev.cellClassName === next.cellClassName &&
    prev.className === next.className &&
    prev.onClick === next.onClick &&
    prev.getIsCustomRow === next.getIsCustomRow &&
    prev.getIsGroupHeaderRow === next.getIsGroupHeaderRow &&
    prev.renderCustomRowContent === next.renderCustomRowContent &&
    prev.renderGroupHeader === next.renderGroupHeader &&
    prev.renderGroupHeaderRowContent === next.renderGroupHeaderRowContent &&
    prev.getGroupTitle === next.getGroupTitle &&
    prev.groupHeaderClassName === next.groupHeaderClassName &&
    prev.attributes === next.attributes &&
    prev.cellAttributes === next.cellAttributes &&
    prev.rowVirtualizer === next.rowVirtualizer &&
    prev['aria-selected'] === next['aria-selected']
  );
}

const BaseRowWithMemoCell = React.forwardRef(function BaseRowWithMemoCellRender<
  TData,
  TScrollElement extends Element | Window,
>(props: BaseRowProps<TData, TScrollElement>, ref: React.Ref<HTMLTableRowElement>) {
  return <BaseRow {...props} Cell={MemoBaseCell} ref={ref} />;
}) as <TData, TScrollElement extends Element | Window = HTMLDivElement>(
  props: BaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement;

export const MemoBaseRow = React.memo(BaseRowWithMemoCell, areEqual) as <
  TData,
  TScrollElement extends Element | Window = HTMLDivElement,
>(
  props: MemoBaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement;
```

Key changes vs. original:

- `MemoBaseRowProps` now adds a single `_rowVersion: readonly unknown[]` (required) instead of overriding `isSelected` / `isExpanded`.
- The comparator's `prev.isSelected === next.isSelected` and `prev.isExpanded === next.isExpanded` are gone; replaced by `arraysShallowEqual(prev._rowVersion, next._rowVersion)`.

- [ ] **Step 3: Update `BaseDraggableRow.memo.tsx`**

Open `src/components/BaseDraggableRow/BaseDraggableRow.memo.tsx`. Replace the entire file contents with:

```tsx
import * as React from 'react';

import {arraysShallowEqual} from '../../utils';
import {MemoBaseCell} from '../BaseCell/BaseCell.memo';

import {BaseDraggableRow} from './BaseDraggableRow';
import type {BaseDraggableRowProps} from './BaseDraggableRow';

export interface MemoBaseDraggableRowProps<
  TData,
  TScrollElement extends Element | Window = HTMLDivElement,
> extends BaseDraggableRowProps<TData, TScrollElement> {
  /** @internal Snapshot of row state — required so the comparator can detect state changes. */
  _rowVersion: readonly unknown[];
}

// eslint-disable-next-line complexity
function areEqual<TData, TScrollElement extends Element | Window>(
  prev: Readonly<MemoBaseDraggableRowProps<TData, TScrollElement>>,
  next: Readonly<MemoBaseDraggableRowProps<TData, TScrollElement>>,
): boolean {
  return (
    prev.row === next.row &&
    arraysShallowEqual(prev._rowVersion, next._rowVersion) &&
    prev.table === next.table &&
    prev.virtualItem?.start === next.virtualItem?.start &&
    prev.virtualItem?.size === next.virtualItem?.size &&
    prev.style === next.style &&
    prev.cellClassName === next.cellClassName &&
    prev.className === next.className &&
    prev.onClick === next.onClick &&
    prev.getIsCustomRow === next.getIsCustomRow &&
    prev.getIsGroupHeaderRow === next.getIsGroupHeaderRow &&
    prev.renderCustomRowContent === next.renderCustomRowContent &&
    prev.renderGroupHeader === next.renderGroupHeader &&
    prev.renderGroupHeaderRowContent === next.renderGroupHeaderRowContent &&
    prev.getGroupTitle === next.getGroupTitle &&
    prev.groupHeaderClassName === next.groupHeaderClassName &&
    prev.attributes === next.attributes &&
    prev.cellAttributes === next.cellAttributes &&
    prev.rowVirtualizer === next.rowVirtualizer &&
    prev['aria-rowindex'] === next['aria-rowindex'] &&
    prev['aria-selected'] === next['aria-selected']
  );
}

const BaseDraggableRowWithMemoCell = React.forwardRef(function BaseDraggableRowWithMemoCellRender<
  TData,
  TScrollElement extends Element | Window,
>(props: BaseDraggableRowProps<TData, TScrollElement>, ref: React.Ref<HTMLTableRowElement>) {
  return <BaseDraggableRow {...props} Cell={MemoBaseCell} ref={ref} />;
}) as <TData, TScrollElement extends Element | Window = HTMLDivElement>(
  props: BaseDraggableRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement;

export const MemoBaseDraggableRow = React.memo(BaseDraggableRowWithMemoCell, areEqual) as <
  TData,
  TScrollElement extends Element | Window = HTMLDivElement,
>(
  props: MemoBaseDraggableRowProps<TData, TScrollElement> & {
    ref?: React.Ref<HTMLTableRowElement>;
  },
) => React.ReactElement;
```

Key changes vs. original: identical pattern as `BaseRow.memo.tsx` — replace `isSelected` / `isExpanded` with `_rowVersion`.

- [ ] **Step 4: Update `BaseTable.tsx` to compute and pass `_rowVersion`**

Open `src/components/BaseTable/BaseTable.tsx`.

Add this module-level helper near the top of the file, after the imports and before the `BaseTableProps` interface (a `function` declaration handles generics cleanly without per-render allocation):

```ts
function defaultGetRowVersion<TData>(row: Row<TData>): readonly unknown[] {
  return [row.getIsSelected(), row.getIsExpanded()];
}
```

Find the destructured props block (lines ~161-206) and add `getRowVersion` near `experimentalMemoization`:

```ts
            experimentalMemoization = false,
            getRowVersion,
```

Just before the `renderBodyRows` function declaration (around line 261), resolve the function once:

```ts
const resolveRowVersion: (row: Row<TData>) => readonly unknown[] =
  getRowVersion ?? defaultGetRowVersion;
```

In `renderBodyRows`, find this block (lines ~270 and ~307-312):

```ts
const isSelected = table.options.enableRowSelection ? row.getIsSelected() : false;
```

Keep this line as-is — it's still used for `aria-selected` on `baseProps`.

Find:

```ts
const memoizedProps: MemoBaseRowProps<TData, TScrollElement> = {
  ...baseProps,
  style: getTreeStyle(row, rows[rowIndex + 1], memoStyleCache.current),
  isSelected,
  isExpanded: row.getIsExpanded(),
};
```

Replace with:

```ts
const memoizedProps: MemoBaseRowProps<TData, TScrollElement> = {
  ...baseProps,
  style: getTreeStyle(row, rows[rowIndex + 1], memoStyleCache.current),
  _rowVersion: resolveRowVersion(row),
};
```

The block that follows (`if (draggableContext) { return <MemoBaseDraggableRow ... />; }` then `return <MemoBaseRow ... />;`) is unchanged — `memoizedProps` now satisfies both `MemoBaseRowProps` and `MemoBaseDraggableRowProps` (both add the same `_rowVersion`).

Verify `Row` is imported from `@tanstack/react-table` at the top of the file. Add it to the imports if missing.

- [ ] **Step 5: Run typecheck**

```bash
npm run typecheck
```

Expected: clean. If there are errors, they'll point at remaining call sites that pass `isSelected` or `isExpanded` directly to `BaseRow`, `BaseCell`, `MemoBaseRow`, or `MemoBaseDraggableRow`. Search the codebase for any leftover usages and remove those props from the call sites — fall back on inline `row.getIsSelected()` / `row.getIsExpanded()` reads if needed:

```bash
grep -rn "isSelected\|isExpanded" src/components/BaseRow src/components/BaseCell src/components/BaseDraggableRow src/components/BaseTable
```

- [ ] **Step 6: Run the existing test suite**

```bash
npm test
```

Expected: all existing tests pass. The current `BaseRow.memo.test.tsx` tests cell-skip-on-rowClassName-change, which is independent of selection/expansion mechanics — it should still pass.

- [ ] **Step 7: Commit the atomic refactor**

```bash
git add src/components/BaseRow src/components/BaseCell src/components/BaseDraggableRow src/components/BaseTable
git commit -m "refactor(memo): replace isSelected/isExpanded lift with getRowVersion + _rowVersion

The MemoBaseRow / MemoBaseDraggableRow / MemoBaseCell comparators now
short-circuit on arraysShallowEqual(_rowVersion). BaseTable computes the
version per row from getRowVersion (default: [getIsSelected, getIsExpanded])
and passes it down. The previously-explicit isSelected/isExpanded props
are removed from BaseRowProps, BaseCellProps, MemoBaseRowProps, and
MemoBaseDraggableRowProps; BaseRow reads row state inline."
```

---

## Task 5: Add tests for `getRowVersion` behavior

**Files:**

- Modify: `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx`

First, ensure the imports at the top of `BaseRow.memo.test.tsx` include `act` and `Row`. Replace the existing imports block at the top of the file:

```tsx
import type {ColumnDef} from '@tanstack/react-table';
import {render} from '@testing-library/react';

import {useTable} from '../../../hooks';
import {Table} from '../../Table';
```

with:

```tsx
import type {ColumnDef, Row} from '@tanstack/react-table';
import {act, render} from '@testing-library/react';

import {useTable} from '../../../hooks';
import {Table} from '../../Table';
```

- [ ] **Step 1: Add a test verifying default `getRowVersion` re-renders only the toggled row on selection change**

After the existing test inside the `describe('MemoBaseRow + MemoBaseCell wiring', () => { ... })` block, add:

```tsx
it('re-renders only the toggled row when row.getIsSelected changes (default getRowVersion)', () => {
  // Capture the table instance so the test can drive state through TanStack
  // without rendering UI controls.
  const tableRef: {current: ReturnType<typeof useTable<Item>> | null} = {current: null};

  const Wrapper = () => {
    const table = useTable({columns, data, getRowId, enableRowSelection: true});
    tableRef.current = table;
    return <Table table={table} experimentalMemoization />;
  };

  render(<Wrapper />);

  expect(cellRenderCount.get('a')).toBe(1);
  expect(cellRenderCount.get('b')).toBe(1);
  expect(cellRenderCount.get('c')).toBe(1);

  // Toggle selection of row b. TanStack updates internal state and triggers
  // a re-render of `Wrapper` (the component using useTable). The default
  // getRowVersion includes getIsSelected, so b's row+cell version changes.
  act(() => {
    tableRef.current!.getRow('b').toggleSelected();
  });

  // a and c: row reference unchanged + version unchanged → memo skips → cell skipped.
  // b: version changed → row re-renders → cell re-renders.
  expect(cellRenderCount.get('a')).toBe(1);
  expect(cellRenderCount.get('b')).toBe(2);
  expect(cellRenderCount.get('c')).toBe(1);
});
```

- [ ] **Step 2: Add a test verifying custom `getRowVersion` triggers cell re-renders for the changed row**

Inside the same `describe` block, append:

```tsx
it('re-renders only the row whose custom version slice changed', () => {
  // Custom external state keyed by row id, not on the row itself.
  const flagged = new Map<string, boolean>([
    ['a', false],
    ['b', false],
    ['c', false],
  ]);

  const getRowVersion = (row: Row<Item>) => [flagged.get(row.id) ?? false] as const;

  const Wrapper = ({forceRerender: _}: {forceRerender: number}) => {
    const table = useTable({columns, data, getRowId});
    return <Table table={table} experimentalMemoization getRowVersion={getRowVersion} />;
  };

  const {rerender} = render(<Wrapper forceRerender={0} />);

  expect(cellRenderCount.get('a')).toBe(1);
  expect(cellRenderCount.get('b')).toBe(1);
  expect(cellRenderCount.get('c')).toBe(1);

  // Mutate the external map for row b only, then force a parent re-render
  // by changing the unrelated `forceRerender` prop.
  flagged.set('b', true);
  rerender(<Wrapper forceRerender={1} />);

  // a and c had unchanged versions ([false]) — skipped.
  // b's version changed ([false] -> [true]) — re-rendered.
  expect(cellRenderCount.get('a')).toBe(1);
  expect(cellRenderCount.get('b')).toBe(2);
  expect(cellRenderCount.get('c')).toBe(1);
});
```

- [ ] **Step 3: Add a test verifying length changes in the version array trigger re-render**

Inside the same `describe` block, append:

```tsx
it('detects length changes in getRowVersion as a state change', () => {
  let extended = false;
  const getRowVersion = (row: Row<Item>) =>
    extended ? ([row.id, 'extra'] as readonly unknown[]) : ([row.id] as readonly unknown[]);

  const Wrapper = ({forceRerender: _}: {forceRerender: number}) => {
    const table = useTable({columns, data, getRowId});
    return <Table table={table} experimentalMemoization getRowVersion={getRowVersion} />;
  };

  const {rerender} = render(<Wrapper forceRerender={0} />);

  expect(cellRenderCount.get('a')).toBe(1);
  expect(cellRenderCount.get('b')).toBe(1);
  expect(cellRenderCount.get('c')).toBe(1);

  // Switch to the longer-array variant. arraysShallowEqual sees a length
  // mismatch and treats every row as changed.
  extended = true;
  rerender(<Wrapper forceRerender={1} />);

  expect(cellRenderCount.get('a')).toBe(2);
  expect(cellRenderCount.get('b')).toBe(2);
  expect(cellRenderCount.get('c')).toBe(2);
});
```

- [ ] **Step 4: Run the test file**

```bash
npm test -- src/components/BaseRow/__tests__/BaseRow.memo.test.tsx
```

Expected: all four tests (the existing one + three new) pass.

- [ ] **Step 5: Run the full suite + typecheck**

```bash
npm run typecheck
npm test
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/BaseRow/__tests__/BaseRow.memo.test.tsx
git commit -m "test(BaseRow.memo): cover default + custom getRowVersion behavior"
```

---

## Task 6: Rewrite the migration doc

**Files:**

- Modify: `docs/MIGRATION-experimentalMemoization.md`

- [ ] **Step 1: Replace the doc contents**

Open `docs/MIGRATION-experimentalMemoization.md` and replace the entire file contents with:

````markdown
# Migrating to `experimentalMemoization`

`experimentalMemoization` is an opt-in flag on `Table` / `BaseTable` that
enables `React.memo` on rows and cells. It can dramatically reduce commit cost
on large tables — but only if the consumer follows the rules below. This guide
covers what the flag does, the anti-patterns that defeat it, and how to verify
the optimization in your own app.

## What memoization can and can't fix

Under the hood:

- TanStack already caches `Row` and `Cell` references across state changes.
- `experimentalMemoization=true` adds React-level `React.memo` on top of
  `BaseRow` (`MemoBaseRow`) and `BaseCell` (`MemoBaseCell`). The comparator
  short-circuits on a snapshot of row state declared by `getRowVersion`.

The flag **does not help** if:

- Cells subscribe to a React Context whose value invalidates on table state
  changes. React context propagation reaches consumers regardless of
  intermediate `React.memo`.
- Function or object props (`rowAttributes`, `cellAttributes`, `rowClassName`,
  `cellClassName`, `onRowClick`, `renderCustomRowContent`, etc.) change
  identity between renders. The comparator does referential equality.
- `getRowVersion` does not list a row state slice that your custom cells
  read. See "Tell the library what state your cells read" below.

## Tell the library what state your cells read

The default comparator covers `row.getIsSelected()` and `row.getIsExpanded()`.
If your custom cells read other row state (or external state keyed by row id),
declare it via `getRowVersion`:

```tsx
import {Table, useTable} from '@gravity-ui/table';
import type {Row} from '@gravity-ui/table/tanstack';

const getRowVersion = (row: Row<MyData>) =>
  [row.getIsSelected(), row.getIsExpanded(), row.getIsPinned()] as const;

<Table table={table} experimentalMemoization getRowVersion={getRowVersion} />;
```

`getRowVersion` is called once per row per parent render. The library compares
the returned arrays element-wise with `Object.is`; any change in any element
invalidates that row's memo.

For external state not on the row itself:

```tsx
const highlightedIds = useHighlightedRowIds(); // Set<string>

const getRowVersion = React.useCallback(
  (row: Row<MyData>) =>
    [row.getIsSelected(), row.getIsExpanded(), highlightedIds.has(row.id)] as const,
  [highlightedIds],
);
```

When `highlightedIds` changes, only rows whose membership flipped re-render.

The function reference itself does not need to be stable — only the values it
returns matter for comparison. Wrap in `useCallback` only if you need stability
for unrelated reasons (e.g. closure capture).

## Anti-pattern checklist

### 1. Inline `rowAttributes` / `cellAttributes` / className functions

**Wrong:**

```tsx
<Table
  table={table}
  rowAttributes={(row) => ({'data-id': row.original.id})}
  experimentalMemoization
/>
```

A fresh function reference is created on every parent render. The
`MemoBaseRow` comparator's `prev.attributes === next.attributes` check fails
for every row.

**Fix:** lift to module scope, or wrap in `useCallback`.

```tsx
const rowAttributes = (row: Row<Item>) => ({'data-id': row.original.id});
// or
const rowAttributes = React.useCallback((row: Row<Item>) => ({'data-id': row.original.id}), []);
```

### 2. Custom React contexts read by cells

**Wrong:**

```tsx
const ExpandedContext = React.createContext({state: {}, toggle: () => {}});

const Provider = ({children}) => {
  const [state, setState] = React.useState({});
  const value = React.useMemo(
    () => ({state, toggle: (id) => setState((s) => ({...s, [id]: !s[id]}))}),
    [state],
  );
  return <ExpandedContext.Provider value={value}>{children}</ExpandedContext.Provider>;
};

const ExpandCell = ({row}) => {
  const {state, toggle} = React.useContext(ExpandedContext); // ← every cell, every toggle
  return <button onClick={() => toggle(row.id)}>{state[row.id] ? '▼' : '▶'}</button>;
};
```

When `state` changes, `value` becomes a new object, every consumer of
`ExpandedContext` re-renders. Even with `experimentalMemoization` on, every
`ExpandCell` re-renders.

**Fix:** read row expansion state from `row.getIsExpanded()`, and toggle via
`row.toggleExpanded()`. If you must persist the state in your own context,
wire `onExpandedChange` on `useTable` to forward TanStack's updates back into
your context's setter.

```tsx
const ExpandCell = ({row}) => {
  return <button onClick={() => row.toggleExpanded()}>{row.getIsExpanded() ? '▼' : '▶'}</button>;
};
```

### 3. Reading row state inside cells

For tree expansion, **use `TreeExpandableCell` from the library**. It encapsulates
the chevron button and toggle handler in one component:

```tsx
import {TreeExpandableCell} from '@gravity-ui/table';

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: 'name',
    cell: (info) => (
      <TreeExpandableCell row={info.row}>{info.getValue<string>()}</TreeExpandableCell>
    ),
  },
];
```

Your code uses only TanStack API (`info.row`, `info.getValue`) plus this one
component. No extra hooks to import.

If you need a custom chevron, call `row.getIsExpanded()` directly — it works
correctly under `experimentalMemoization` because the default `getRowVersion`
includes expansion:

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

If your cells read row state outside of selection/expansion (e.g.
`row.getIsPinned()`), pass `getRowVersion` so the comparator knows about it —
see "Tell the library what state your cells read" above.

### 4. Fresh `state` object in `useTable`

Minor compared to the others, but worth noting:

```tsx
useTable({
  columns,
  data,
  state: {columnPinning: {left: [], right: []}}, // ← fresh object every render
});
```

If `state` slices need to be stable, lift them or `useMemo` them. This is more
about avoiding unnecessary TanStack-internal work than about React row memo.

## Verification recipe

1. Open the page in development mode.
2. Open React DevTools → Profiler. Enable
   "Highlight updates when components render" (the gear icon).
3. Click "Record".
4. Toggle expansion on a single row.
5. Stop recording.

**Expected commit footprint:** the toggled row + its newly visible children.
Any other rows highlighting is a regression — likely an anti-pattern from the
checklist above.

## Worked example: arcadia QuotasTable3

Before:

```tsx
// QuotasTable3.tsx
<Table
  table={table}
  rowAttributes={(row) => getRowAttributes(row.original)} // anti-pattern #1
  experimentalMemoization
/>
```

After:

```tsx
// QuotasTable3.tsx — rowAttributes lifted to module scope
const rowAttributesHandler = (row: Row<QuotasTable3Row>) => getRowAttributes(row.original);

// ...

<Table table={table} rowAttributes={rowAttributesHandler} experimentalMemoization />;
```

If a future column reads e.g. `row.getIsPinned()`:

```tsx
const getRowVersion = (row: Row<QuotasTable3Row>) =>
  [row.getIsSelected(), row.getIsExpanded(), row.getIsPinned()] as const;

<Table
  table={table}
  rowAttributes={rowAttributesHandler}
  experimentalMemoization
  getRowVersion={getRowVersion}
/>;
```

The cell renderer for that column uses pure TanStack API (`row.getIsPinned()`)
— no special hook required.
````

- [ ] **Step 2: Verify markdown lint passes (if a lint step exists)**

```bash
npm run lint:prettier
```

Expected: clean. If prettier rewrites the file, accept the rewrite.

- [ ] **Step 3: Commit**

```bash
git add docs/MIGRATION-experimentalMemoization.md
git commit -m "docs(migration): rewrite for getRowVersion API"
```

---

## Task 7: Add a "Memoization (experimental)" section to the README

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Read the current README to find a sensible insertion point**

```bash
head -80 README.md
```

Note the existing top-level section structure. Insert the new section **after** the first installation/usage section and **before** the changelog or license, alphabetized as appropriate. If the README has a clear list of features or sections, fit the new section there.

- [ ] **Step 2: Append the section**

Append (or insert at the chosen point) this content to `README.md`:

````markdown
## Memoization (experimental)

Pass `experimentalMemoization` on `Table` / `BaseTable` to enable
`React.memo` on rows and cells. This avoids re-rendering every row and cell
when one row's state changes. The flag is opt-in; without it the rendering
behavior is unchanged.

```tsx
<Table table={table} experimentalMemoization />
```

By default, the memo comparator tracks `row.getIsSelected()` and
`row.getIsExpanded()`. If your custom cells read other row state (or external
state keyed by row id), declare it via `getRowVersion`:

```tsx
const getRowVersion = (row: Row<MyData>) =>
  [row.getIsSelected(), row.getIsExpanded(), row.getIsPinned()] as const;

<Table table={table} experimentalMemoization getRowVersion={getRowVersion} />;
```

`getRowVersion` is called once per row per parent render. Returned values are
compared element-wise with `Object.is` — any change invalidates the row's memo
and re-renders only that row's cells.

See [`docs/MIGRATION-experimentalMemoization.md`](docs/MIGRATION-experimentalMemoization.md)
for anti-patterns that defeat memoization, the verification recipe, and a
worked migration example.
````

- [ ] **Step 3: Verify markdown lint passes**

```bash
npm run lint:prettier
```

Expected: clean. Accept any prettier rewrites.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs(README): add Memoization (experimental) section"
```

---

## Task 8: Final verification

- [ ] **Step 1: Full typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 2: Full test suite**

```bash
npm test
```

Expected: clean.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: clean. Address any lint issues before moving on (likely none — this change is mechanical and the existing lint config covered the prior code).

- [ ] **Step 4: Manual smoke test of memoization stories**

```bash
npm start
```

Open Storybook, exercise:

- `Tree` / `VirtualizedTree` / `TreeWithGroups` / `ReorderingTree` / `GroupingWithSelection` — confirm visual output is unchanged with `experimentalMemoization` off (the default path).
- Same stories with `experimentalMemoization` on (toggle in Storybook controls if exposed; otherwise temporarily edit the story file): expand/collapse a row, select a row — confirm visual output is correct.
- `RenderCountTreeStory` — confirm per-row render count behaves as expected when toggling expansion.

- [ ] **Step 5: Verify the diff against the spec**

Open `docs/superpowers/specs/2026-04-29-getRowVersion-design.md` and walk through each section. Confirm every requirement has been implemented:

- New `getRowVersion` prop on `BaseTableProps` — Task 2.
- Default `[row.getIsSelected(), row.getIsExpanded()]` — Task 4 step 4.
- `arraysShallowEqual` helper — Task 1.
- Comparators replaced — Task 3 + Task 4 steps 2-3.
- `isSelected` / `isExpanded` removed from all four interfaces — Task 3 step 1, Task 4 step 1, Task 4 steps 2-3.
- `BaseRow.tsx` reads state inline — Task 4 step 1.
- `BaseTable.tsx` computes per-row version — Task 4 step 4.
- Tests cover default + custom + length-change — Task 5.
- Migration doc rewritten — Task 6.
- README section — Task 7.

- [ ] **Step 6: Confirm `useIsExpanded` / `useRowState` / `RowStateContext` references are gone**

```bash
grep -rn "useIsExpanded\|useRowState\|RowStateContext" src docs README.md
```

Expected: no matches in `src/`. The previous migration doc mentioned them but should be gone after Task 6.

- [ ] **Step 7: Final commit (if anything was tweaked during verification)**

If steps 1-6 surfaced any small fixes:

```bash
git add -A
git commit -m "chore: post-implementation polish for getRowVersion"
```

Otherwise, no commit needed — the work is complete on the previous task commits.
