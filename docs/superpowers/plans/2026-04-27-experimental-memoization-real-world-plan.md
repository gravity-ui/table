# Real-world `experimentalMemoization` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `experimentalMemoization` actually pay off in the arcadia QuotasTable3 consumer by wiring `MemoBaseCell` into `BaseRow`, adding a dev-only stability warning, shipping an anti-pattern Storybook demo + migration doc, and applying three small fixes to QuotasTable3.

**Architecture:** Library-first then consumer. Library Phase L1 wires `MemoBaseCell` into `BaseRow` via an internal `Cell` prop. Phase L2 adds a `useStableRefWarning` hook called from `BaseTable` for every prop the row memo comparator depends on. Phases L3–L4 add the storybook story and migration doc (no behavioral change). Phase C in the arcadia repo stabilizes `rowAttributes`, replaces the local `TreeExpandableCell`'s custom-context subscription with the library's `useIsExpanded(row)` hook, and bridges TanStack's `onExpandedChange` back into the persisted `CollapsibleStateContext`.

**Tech Stack:** React 18, TypeScript, `@tanstack/react-table` v8.20.6, Jest + `@testing-library/react`, Storybook.

**Spec:** `docs/superpowers/specs/2026-04-27-experimental-memoization-real-world-design.md`.

---

## File structure

### Library — created

| File                                                                            | Responsibility                                                                                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/useStableRefWarning.ts`                                              | Dev-only hook. Warns once per (component instance, prop name) when a tracked value's identity changes between renders.                                   |
| `src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx` | Storybook story with three independent toggles (`experimentalMemoization`, `unstableRowAttributes`, `customContextFanout`) and per-cell render counters. |
| `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx`                        | Tests that `MemoBaseRow` skips cell re-renders when row attributes change but cell content didn't.                                                       |
| `src/hooks/__tests__/useStableRefWarning.test.tsx`                              | Unit tests for `useStableRefWarning`.                                                                                                                    |
| `src/components/BaseTable/__tests__/BaseTable.memo.warning.test.tsx`            | Asserts `BaseTable` calls `useStableRefWarning` for tracked props.                                                                                       |
| `docs/MIGRATION-experimentalMemoization.md`                                     | Consumer recipe. Anti-pattern checklist, verification recipe, worked QuotasTable3 example.                                                               |

### Library — modified

| File                                                 | Change                                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/BaseRow/BaseRow.tsx`                 | Add optional internal `Cell?: React.FunctionComponent<BaseCellProps<TData>>` prop, default to `BaseCell`. Replace the two `<BaseCell />` JSX nodes (lines 115, 144) with `<Cell />`. |
| `src/components/BaseRow/BaseRow.memo.tsx`            | Pass `Cell={MemoBaseCell}` when rendering `BaseRow`. Update comparator to ignore `Cell` (always passed by `MemoBaseRow`).                                                            |
| `src/components/BaseTable/BaseTable.tsx`             | Call `useStableRefWarning` for the props `MemoBaseRow.areEqual` checks; gate on `experimentalMemoization`.                                                                           |
| `src/components/Table/__stories__/Table.stories.tsx` | Register the new anti-pattern story.                                                                                                                                                 |

### Consumer (arcadia) — modified

| File                                                                                                                            | Change                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx`                                     | Lift `rowAttributes` to module scope. Add `onExpandedChange: setExpandedFromContext` to `useTable`.                             |
| `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/TreeExpandableCell.tsx` | Swap `useRowExpandedState` + `useToggleRowState` for `useIsExpanded(row)` + `row.toggleExpanded()`.                             |
| `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx`                          | Remove `useRowExpandedState`, `useToggleRowState`, `getLocalState`, `toggleState`, `stateRef`. Add `useSetExpandedFromContext`. |

---

## Phase L1 — Wire `MemoBaseCell` into `BaseRow`

### Task L1.1: Add `BaseRow.memo.test.tsx` — failing test for cell-skip-when-row-class-changes

**Files:**

- Create: `src/components/BaseRow/__tests__/BaseRow.memo.test.tsx`

- [ ] **Step 1: Create the failing test**

```tsx
// src/components/BaseRow/__tests__/BaseRow.memo.test.tsx
import * as React from 'react';

import {render} from '@testing-library/react';
import type {ColumnDef} from '@tanstack/react-table';

import {Table} from '../../Table';
import {useTable} from '../../../hooks';

interface Item {
  id: string;
  name: string;
}

const cellRenderCount = new Map<string, number>();

const NameCell: React.FC<{id: string; value: string}> = ({id, value}) => {
  cellRenderCount.set(id, (cellRenderCount.get(id) ?? 0) + 1);
  return <span>{value}</span>;
};

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: 'name',
    cell: (info) => <NameCell id={info.row.id} value={info.getValue<string>()} />,
  },
];

const data: Item[] = [
  {id: 'a', name: 'A'},
  {id: 'b', name: 'B'},
  {id: 'c', name: 'C'},
];

const getRowId = (row: Item) => row.id;

describe('MemoBaseRow + MemoBaseCell wiring', () => {
  beforeEach(() => {
    cellRenderCount.clear();
  });

  it('does not re-run the cell renderer when only the row className changes', () => {
    const Wrapper: React.FC<{className: string}> = ({className}) => {
      const table = useTable({columns, data, getRowId});
      return <Table table={table} rowClassName={className} experimentalMemoization />;
    };

    const {rerender} = render(<Wrapper className="v1" />);

    // Baseline: every cell rendered exactly once.
    expect(cellRenderCount.get('a')).toBe(1);
    expect(cellRenderCount.get('b')).toBe(1);
    expect(cellRenderCount.get('c')).toBe(1);

    // Force a row-level re-render by changing the className. cell objects from
    // tanstack are stable across this re-render, so MemoBaseCell should skip.
    rerender(<Wrapper className="v2" />);

    expect(cellRenderCount.get('a')).toBe(1);
    expect(cellRenderCount.get('b')).toBe(1);
    expect(cellRenderCount.get('c')).toBe(1);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --testPathPattern=BaseRow.memo.test`
Expected: FAIL — `cellRenderCount.get('a')` is `2` (not `1`) on the second `rerender` because `BaseRow` always renders plain `BaseCell`, which has no memo.

- [ ] **Step 3: Add the `Cell` prop to `BaseRow`**

Modify `src/components/BaseRow/BaseRow.tsx`:

1. Extend `BaseRowProps` after the existing props (insert before the closing `}`):

```tsx
    /**
     * @internal
     * Cell component to render. Defaults to `BaseCell`. `MemoBaseRow` passes
     * `MemoBaseCell` so that cell-level memoization is active when
     * experimentalMemoization is enabled. Not part of the public API.
     */
    Cell?: React.FunctionComponent<BaseCellProps<TData>>;
```

2. In the `forwardRef` destructuring, add `Cell = BaseCell,` after `cellAttributes,`.

3. Replace the two `<BaseCell ... />` JSX nodes with `<Cell ... />`. Lines `115` (group-header path) and `144` (regular cells path) become:

```tsx
                    <Cell
                        className={cellClassName}
                        colSpan={row.getVisibleCells().length}
                        attributes={cellAttributes}
                        aria-colindex={1}
                    >
```

and

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
    />
  ));
```

The two existing usages that pass `BaseCell` as a prop value (`Cell: BaseCell` at lines 110, 139 inside the `renderGroupHeaderRowContent` and `renderCustomRowContent` callbacks) stay as-is — those are public API contracts that hand a `Cell` component to user-supplied render fns, and the public surface still exposes `BaseCell`.

- [ ] **Step 4: Wire `MemoBaseCell` from `MemoBaseRow`**

Modify `src/components/BaseRow/BaseRow.memo.tsx`:

1. Add an import at the top:

```tsx
import {MemoBaseCell} from '../BaseCell/BaseCell.memo';
```

2. Wrap the `BaseRow` reference passed to `React.memo` so it receives `Cell={MemoBaseCell}`. Replace:

```tsx
export const MemoBaseRow = React.memo(BaseRow, areEqual) as (<
  TData,
  TScrollElement extends Element | Window = HTMLDivElement,
>(
  props: MemoBaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName?: string};
```

with:

```tsx
const BaseRowWithMemoCell = React.forwardRef(function BaseRowWithMemoCellRender<
  TData,
  TScrollElement extends Element | Window,
>(props: BaseRowProps<TData, TScrollElement>, ref: React.Ref<HTMLTableRowElement>) {
  return <BaseRow {...props} Cell={MemoBaseCell} ref={ref} />;
}) as <TData, TScrollElement extends Element | Window = HTMLDivElement>(
  props: BaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement;

export const MemoBaseRow = React.memo(BaseRowWithMemoCell, areEqual) as (<
  TData,
  TScrollElement extends Element | Window = HTMLDivElement,
>(
  props: MemoBaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName?: string};
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `npm test -- --testPathPattern=BaseRow.memo.test`
Expected: PASS — both renders show count 1 for every cell.

- [ ] **Step 6: Run typecheck and the rest of the test suite**

Run: `npm run typecheck && npm test`
Expected: clean typecheck and all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/BaseRow/BaseRow.tsx \
        src/components/BaseRow/BaseRow.memo.tsx \
        src/components/BaseRow/__tests__/BaseRow.memo.test.tsx
git commit -m "fix(BaseRow): wire MemoBaseCell into BaseRow under experimentalMemoization"
```

---

## Phase L2 — Dev-only `useStableRefWarning`

### Task L2.1: Write `useStableRefWarning` with TDD

**Files:**

- Create: `src/hooks/useStableRefWarning.ts`
- Create: `src/hooks/__tests__/useStableRefWarning.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/hooks/__tests__/useStableRefWarning.test.tsx
import * as React from 'react';

import {render} from '@testing-library/react';

import {useStableRefWarning} from '../useStableRefWarning';

describe('useStableRefWarning', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  function Probe({name, value, enabled}: {name: string; value: unknown; enabled: boolean}) {
    useStableRefWarning(name, value, enabled);
    return null;
  }

  it('does not warn when ref is stable', () => {
    const stable = () => {};
    const {rerender} = render(<Probe name="rowAttributes" value={stable} enabled />);
    rerender(<Probe name="rowAttributes" value={stable} enabled />);
    rerender(<Probe name="rowAttributes" value={stable} enabled />);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns once per name when ref changes between renders', () => {
    const {rerender} = render(<Probe name="rowAttributes" value={() => {}} enabled />);
    rerender(<Probe name="rowAttributes" value={() => {}} enabled />);
    rerender(<Probe name="rowAttributes" value={() => {}} enabled />);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('rowAttributes');
    expect(warnSpy.mock.calls[0][0]).toContain('experimentalMemoization');
  });

  it('does not warn when enabled is false', () => {
    const {rerender} = render(<Probe name="rowAttributes" value={() => {}} enabled={false} />);
    rerender(<Probe name="rowAttributes" value={() => {}} enabled={false} />);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run: `npm test -- --testPathPattern=useStableRefWarning.test`
Expected: FAIL — module `../useStableRefWarning` does not exist.

- [ ] **Step 3: Implement the hook**

```ts
// src/hooks/useStableRefWarning.ts
import * as React from 'react';

const MIGRATION_DOC = 'docs/MIGRATION-experimentalMemoization.md';

/**
 * @internal
 * Dev-only. Warns once per (component instance, name) when `value` changes
 * identity between renders while `enabled` is true. Used by `BaseTable` to
 * surface props that defeat row memoization.
 *
 * Always silent in production builds and when `enabled` is false.
 */
export function useStableRefWarning(name: string, value: unknown, enabled: boolean): void {
  const prevRef = React.useRef<{value: unknown; warned: boolean} | null>(null);

  if (process.env.NODE_ENV === 'production' || !enabled) {
    return;
  }

  if (prevRef.current === null) {
    prevRef.current = {value, warned: false};
    return;
  }

  if (prevRef.current.warned) {
    prevRef.current.value = value;
    return;
  }

  if (prevRef.current.value !== value) {
    // eslint-disable-next-line no-console
    console.warn(
      `[gravity-ui/table] experimentalMemoization is enabled but \`${name}\` ` +
        `changes reference between renders, which defeats row memoization. ` +
        `Wrap it in useCallback / useMemo or lift it out of the render path. ` +
        `See: ${MIGRATION_DOC}`,
    );
    prevRef.current.warned = true;
  }

  prevRef.current.value = value;
}
```

- [ ] **Step 4: Run test and verify it passes**

Run: `npm test -- --testPathPattern=useStableRefWarning.test`
Expected: PASS — all three cases pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStableRefWarning.ts \
        src/hooks/__tests__/useStableRefWarning.test.tsx
git commit -m "feat(hooks): add dev-only useStableRefWarning hook"
```

### Task L2.2: Wire `useStableRefWarning` into `BaseTable`

**Files:**

- Modify: `src/components/BaseTable/BaseTable.tsx`
- Create: `src/components/BaseTable/__tests__/BaseTable.memo.warning.test.tsx`

- [ ] **Step 1: Write the failing integration test**

```tsx
// src/components/BaseTable/__tests__/BaseTable.memo.warning.test.tsx
import * as React from 'react';

import {render} from '@testing-library/react';
import type {ColumnDef} from '@tanstack/react-table';

import {Table} from '../../Table';
import {useTable} from '../../../hooks';

interface Item {
  id: string;
  name: string;
}

const data: Item[] = [{id: 'a', name: 'A'}];
const columns: ColumnDef<Item>[] = [{accessorKey: 'name'}];

describe('BaseTable + experimentalMemoization stability warnings', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  function Wrapper({version, memoize}: {version: number; memoize: boolean}) {
    const table = useTable({columns, data, getRowId: (row) => row.id});
    // Inline rowAttributes — fresh ref every render.
    const rowAttributes = (_row: any) => ({'data-version': String(version)});
    return <Table table={table} rowAttributes={rowAttributes} experimentalMemoization={memoize} />;
  }

  it('warns once when rowAttributes changes ref under experimentalMemoization', () => {
    const {rerender} = render(<Wrapper version={1} memoize />);
    rerender(<Wrapper version={2} memoize />);
    rerender(<Wrapper version={3} memoize />);

    const rowAttributesWarnings = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('`rowAttributes`'),
    );
    expect(rowAttributesWarnings).toHaveLength(1);
  });

  it('does not warn when experimentalMemoization is off', () => {
    const {rerender} = render(<Wrapper version={1} memoize={false} />);
    rerender(<Wrapper version={2} memoize={false} />);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --testPathPattern=BaseTable.memo.warning.test`
Expected: FAIL — no warning is emitted (hook not yet wired).

- [ ] **Step 3: Wire the hook into `BaseTable`**

Modify `src/components/BaseTable/BaseTable.tsx`:

1. Add an import at the top with the other hooks imports:

```tsx
import {useStableRefWarning} from '../../hooks/useStableRefWarning';
```

2. Inside the `BaseTable` component body, immediately after the existing `const draggableContext = React.useContext(SortableListContext);` line (around line 180), add the warning calls:

```tsx
// Dev-only: warn once when memoization-sensitive props change ref between renders.
useStableRefWarning('rowAttributes', rowAttributes, experimentalMemoization);
useStableRefWarning('cellAttributes', cellAttributes, experimentalMemoization);
useStableRefWarning('cellClassName', cellClassName, experimentalMemoization);
useStableRefWarning('rowClassName', rowClassName, experimentalMemoization);
useStableRefWarning('onRowClick', onRowClick, experimentalMemoization);
useStableRefWarning('getIsCustomRow', getIsCustomRow, experimentalMemoization);
useStableRefWarning('getIsGroupHeaderRow', getIsGroupHeaderRow, experimentalMemoization);
useStableRefWarning('renderCustomRowContent', renderCustomRowContent, experimentalMemoization);
useStableRefWarning('renderGroupHeader', renderGroupHeader, experimentalMemoization);
useStableRefWarning(
  'renderGroupHeaderRowContent',
  renderGroupHeaderRowContent,
  experimentalMemoization,
);
useStableRefWarning('getGroupTitle', getGroupTitle, experimentalMemoization);
useStableRefWarning('groupHeaderClassName', groupHeaderClassName, experimentalMemoization);
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- --testPathPattern=BaseTable.memo.warning.test`
Expected: PASS — both cases pass.

- [ ] **Step 5: Run the full test suite + typecheck**

Run: `npm run typecheck && npm test`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/BaseTable/BaseTable.tsx \
        src/components/BaseTable/__tests__/BaseTable.memo.warning.test.tsx
git commit -m "feat(BaseTable): warn on unstable props under experimentalMemoization"
```

---

## Phase L3 — Storybook anti-pattern story

### Task L3.1: Create the anti-pattern story

**Files:**

- Create: `src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx`
- Modify: `src/components/Table/__stories__/Table.stories.tsx`

- [ ] **Step 1: Create the story file**

```tsx
// src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx
import * as React from 'react';

import type {ColumnDef, ExpandedState, Row} from '@tanstack/react-table';

import {useRenderCount, useTable} from '../../../../hooks';
import {useIsExpanded} from '../../../BaseRow/RowStateContext';
import {Table} from '../../Table';
import type {TableProps} from '../../Table';

interface Item {
  id: string;
  name: string;
  children?: Item[];
}

function buildData(): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < 50; i++) {
    const children: Item[] = [];
    for (let j = 0; j < 20; j++) {
      children.push({id: `${i}-${j}`, name: `Row ${i}.${j}`});
    }
    items.push({id: `${i}`, name: `Group ${i}`, children});
  }
  return items;
}

const data = buildData();

// A custom context whose value invalidates on every expand toggle. Cells that
// consume it re-render even when their row is memoized — the same anti-pattern
// QuotasTable3's CollapsibleStateContext exhibits.
interface FanoutContextShape {
  expanded: ExpandedState;
}
const FanoutContext = React.createContext<FanoutContextShape | undefined>(undefined);

const NameCell = <TData extends Item>({
  row,
  value,
  customContextFanout,
}: {
  row: Row<TData>;
  value: string;
  customContextFanout: boolean;
}) => {
  // Subscribe via library hook (memo-friendly).
  const isExpandedFromLibrary = useIsExpanded(row);

  // Subscribe via custom context (memo-defeating). Read but don't use, to
  // demonstrate that mere subscription causes re-renders when the value flips.
  const fanoutCtx = React.useContext(FanoutContext);
  const isExpanded = customContextFanout ? Boolean(fanoutCtx) : isExpandedFromLibrary;

  const renderCount = useRenderCount();

  return (
    <div
      style={{
        paddingLeft: 28 * row.depth,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {row.getCanExpand() && (
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 4px',
          }}
          onClick={row.getToggleExpandedHandler()}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      )}
      <span>{value}</span>
      <span
        style={{
          marginLeft: 'auto',
          fontSize: 11,
          color: renderCount > 1 ? 'red' : 'green',
          fontFamily: 'monospace',
        }}
      >
        renders: {renderCount}
      </span>
    </div>
  );
};

const stableRowAttributes = () => ({});

export const RenderCountTreeAntiPatternsStory = (props: Partial<TableProps<Item>>) => {
  const [experimentalMemoization, setExperimentalMemoization] = React.useState(true);
  const [unstableRowAttributes, setUnstableRowAttributes] = React.useState(false);
  const [customContextFanout, setCustomContextFanout] = React.useState(false);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const columns = React.useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 400,
        cell: (info) => (
          <NameCell
            row={info.row}
            value={info.getValue<string>()}
            customContextFanout={customContextFanout}
          />
        ),
      },
      {accessorKey: 'id', header: 'ID', size: 120},
    ],
    [customContextFanout],
  );

  const table = useTable({
    columns,
    data,
    getSubRows: (item) => item.children,
    enableExpanding: true,
    onExpandedChange: setExpanded,
    state: {expanded},
  });

  // Inline `rowAttributes` is the anti-pattern; module-level is the fix.
  const inlineRowAttributes = (_row: Row<Item>) => ({});
  const rowAttributes = unstableRowAttributes ? inlineRowAttributes : stableRowAttributes;

  const fanoutValue = React.useMemo(() => ({expanded}), [expanded]);

  return (
    <FanoutContext.Provider value={fanoutValue}>
      <div>
        <div
          style={{
            marginBottom: 12,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={experimentalMemoization}
              onChange={(e) => {
                setExperimentalMemoization(e.target.checked);
                setExpanded({});
              }}
              style={{marginRight: 6}}
            />
            experimentalMemoization
          </label>
          <label>
            <input
              type="checkbox"
              checked={unstableRowAttributes}
              onChange={(e) => setUnstableRowAttributes(e.target.checked)}
              style={{marginRight: 6}}
            />
            unstableRowAttributes (anti-pattern)
          </label>
          <label>
            <input
              type="checkbox"
              checked={customContextFanout}
              onChange={(e) => setCustomContextFanout(e.target.checked)}
              style={{marginRight: 6}}
            />
            customContextFanout (anti-pattern)
          </label>
        </div>
        <p style={{fontSize: 12, color: '#666', marginTop: 0}}>
          Toggle a row and watch the render counters. With memoization ON and both anti-patterns
          OFF, only the toggled row + its children should turn red. Flip each anti-pattern to see
          how it defeats the optimization.
        </p>
        <div style={{height: '70vh', overflow: 'auto'}}>
          <Table
            {...props}
            table={table}
            experimentalMemoization={experimentalMemoization}
            rowAttributes={rowAttributes}
          />
        </div>
      </div>
    </FanoutContext.Provider>
  );
};
```

- [ ] **Step 2: Register the story in `Table.stories.tsx`**

Modify `src/components/Table/__stories__/Table.stories.tsx`:

1. Add an import next to the existing `RenderCountTreeStory` import (line 9):

```tsx
import {RenderCountTreeAntiPatternsStory} from './stories/RenderCountTreeAntiPatternsStory';
```

2. Append a new story export at the bottom of the file (after the existing `RenderCountTree` export):

```tsx
export const RenderCountTreeAntiPatterns: StoryObj<typeof RenderCountTreeAntiPatternsStory> = {
  render: RenderCountTreeAntiPatternsStory,
  name: 'Experimental: Anti-patterns that defeat memoization',
};
```

- [ ] **Step 3: Verify typecheck and tests still pass**

Run: `npm run typecheck && npm test`
Expected: clean.

- [ ] **Step 4: Manual smoke test**

Run: `npm start`

- Navigate to the new "Experimental: Anti-patterns that defeat memoization" story.
- Confirm: with memoization ON and both anti-patterns OFF, expanding a single group only flips counters for that group and its newly visible children. Other counters stay green/1.
- Toggle `unstableRowAttributes` ON. Expand a different group. All visible row counters flip red. Toggle OFF.
- Toggle `customContextFanout` ON. Expand any group. All visible name-cell counters flip red. Toggle OFF.

If any expectation fails, treat that as a regression — do not proceed to commit.

- [ ] **Step 5: Commit**

```bash
git add src/components/Table/__stories__/stories/RenderCountTreeAntiPatternsStory.tsx \
        src/components/Table/__stories__/Table.stories.tsx
git commit -m "docs(storybook): add anti-pattern memoization demo story"
```

---

## Phase L4 — Migration doc

### Task L4.1: Write `MIGRATION-experimentalMemoization.md`

**Files:**

- Create: `docs/MIGRATION-experimentalMemoization.md`

- [ ] **Step 1: Write the doc**

````markdown
# Migrating to `experimentalMemoization`

`experimentalMemoization` is an opt-in flag on `Table` / `BaseTable` that
enables `React.memo` on rows and cells. It can dramatically reduce commit cost
on large tables — but only if the consumer follows the rules below. This guide
covers what the flag actually does, the anti-patterns that defeat it, and how
to verify the optimization in your own app.

## What memoization can and can't fix

Under the hood:

- TanStack already caches `Row` and `Cell` references across state changes.
- `experimentalMemoization=true` adds React-level `React.memo` on top of
  `BaseRow` (`MemoBaseRow`) and `BaseCell` (`MemoBaseCell`). The comparator
  checks every prop the row receives, plus explicit `isSelected` / `isExpanded`
  state slices.

The flag **does not help** if:

- Cells subscribe to a React Context whose value invalidates on table state
  changes. React context propagation reaches consumers regardless of
  intermediate `React.memo`.
- Function or object props (`rowAttributes`, `cellAttributes`, `rowClassName`,
  `cellClassName`, `onRowClick`, `renderCustomRowContent`, etc.) change
  identity between renders. The comparator does referential equality.
- Cells call `row.getIsExpanded()` / `row.getIsSelected()` directly. Those
  read live state from the table; when memo skips re-render, the displayed
  value goes stale. Use the `useIsExpanded(row)` / `useRowState()` hooks
  instead.

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
````

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

**Fix:** read row expansion state from `useIsExpanded(row)`, and toggle via
`row.toggleExpanded()`. If you must persist the state in your own context,
wire `onExpandedChange` on `useTable` to forward TanStack's updates back into
your context's setter.

```tsx
import {useIsExpanded} from '@gravity-ui/table';

const ExpandCell = ({row}) => {
  const expanded = useIsExpanded(row);
  return <button onClick={() => row.toggleExpanded()}>{expanded ? '▼' : '▶'}</button>;
};
```

### 3. `row.getIsExpanded()` / `row.getIsSelected()` in custom cells

**Wrong:**

```tsx
const NameCell = ({row}) => {
  const expanded = row.getIsExpanded(); // ← reads live state; stale after memo skip
  return (
    <span>
      {expanded ? '▼' : '▶'} {row.original.name}
    </span>
  );
};
```

**Fix:** use `useIsExpanded(row)` (subscribes to `RowStateContext` provided by
`MemoBaseRow`, falls back to `row.getIsExpanded()` outside the memo path):

```tsx
import {useIsExpanded} from '@gravity-ui/table';

const NameCell = ({row}) => {
  const expanded = useIsExpanded(row);
  return (
    <span>
      {expanded ? '▼' : '▶'} {row.original.name}
    </span>
  );
};
```

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

In the development console you should also see no
`[gravity-ui/table] experimentalMemoization is enabled but ...` warnings. If
you do, the warning names the offending prop; cross-reference with the
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

```tsx
// TreeExpandableCell.tsx (anti-pattern #2)
const expanded = useRowExpandedState(rowId); // subscribes to fanout context
const toggleExpanded = useToggleRowState(rowId); // ditto
```

After:

```tsx
// QuotasTable3.tsx — rowAttributes lifted to module scope
const rowAttributesHandler = (row: Row<QuotasTable3Row>) => getRowAttributes(row.original);

// ...

<Table table={table} rowAttributes={rowAttributesHandler} experimentalMemoization />;
```

```tsx
// TreeExpandableCell.tsx — library hooks
import {useIsExpanded} from '@gravity-ui/table';

const expanded = useIsExpanded(row);
const handleButtonClick = React.useCallback(() => row.toggleExpanded(), [row]);
```

```tsx
// QuotasTable3.tsx — bridge TanStack's onExpandedChange back into the persisted context
const onExpandedChange = useSetExpandedFromContext();
const table = useTable({
    // ...
    onExpandedChange,
    state: {expanded, ...},
});
```

The custom `CollapsibleStateContext` still owns the persisted expansion map
(used by expand-all / collapse-all buttons elsewhere on the page), but cells
no longer subscribe to it — its value invalidations only re-render the table
container, which has to re-render anyway when expansion changes.

````

- [ ] **Step 2: Commit**

```bash
git add docs/MIGRATION-experimentalMemoization.md
git commit -m "docs: add migration guide for experimentalMemoization"
````

---

## Phase C — Consumer fix in arcadia

> All paths in Phase C are in `/home/chelentos/arcadia/data-ui/abcd/`. Run commands from that directory unless noted.

### Task C.0: Pre-flight check on `useCurrencyVisibilityContext` stability

**Files:**

- Read: `/home/chelentos/arcadia/data-ui/abcd/src/ui/utils/currencyVisibilityContext.tsx` (path may vary; locate by import in `useColumns.tsx`).

- [ ] **Step 1: Locate the provider**

Run: `grep -rn "currencyVisibilityContext" /home/chelentos/arcadia/data-ui/abcd/src/ui/utils/`
Identify the file that exports `CurrencyVisibilityContext.Provider` (or similar).

- [ ] **Step 2: Inspect the provider value**

Open the file. Find the `<Context.Provider value={...}>`.

**If the value is wrapped in `React.useMemo`** with stable deps → no action needed; record this in your PR description and proceed to Task C.1.

**If the value is a fresh object on every render** (e.g., `value={{costVisible, setCostVisible}}`) → the `useColumns` hook in QuotasTable3 will rebuild `columns` on every render of the provider, which defeats more than just row memo. Two options:

1. **Fix the provider** — wrap the value in `useMemo`. Smallest change, broadest benefit.
2. **Fix the consumer** — change `useColumns` (in `QuotasTable3/hooks/useColumns.tsx`) to depend on the individual primitives (`costVisible`) rather than the whole context object.

Pick option 1 if the provider has few consumers. Pick option 2 if there's risk of breaking other consumers. Either way, this is a single small edit; do it now and commit separately.

- [ ] **Step 3: Commit (only if a fix was needed)**

```bash
git add <provider-or-useColumns-file>
git commit -m "perf(currencyVisibility): stabilize provider value to enable downstream memo"
```

### Task C.1: Stabilize `rowAttributes` in `QuotasTable3.tsx`

**Files:**

- Modify: `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx`

- [ ] **Step 1: Lift the handler to module scope**

In `QuotasTable3.tsx`, after the existing module-scope handlers around line 102 (`cellClassName`, `rowClassName`, `headerClassName`), add:

```tsx
import type {Row} from '@gravity-ui/table/tanstack';

// ... existing imports and helpers ...

// Стабильный rowAttributes-обработчик: один и тот же ref между рендерами.
const rowAttributesHandler = (row: Row<QuotasTable3Row>) => getRowAttributes(row.original);
```

If `Row` is already imported from `@gravity-ui/table/tanstack`, skip the import line.

- [ ] **Step 2: Replace the inline arrow on line 153**

Change:

```tsx
                rowAttributes={(row) => getRowAttributes(row.original)}
```

to:

```tsx
rowAttributes = {rowAttributesHandler};
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck` (or the arcadia equivalent for this package — typically `npm run lint`).
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx
git commit -m "perf(QuotasTable3): stabilize rowAttributes for experimentalMemoization"
```

### Task C.2: Add `useSetExpandedFromContext` bridge

**Files:**

- Modify: `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx`

- [ ] **Step 1: Add the hook**

In `collapsibleStateContext.tsx`, append after the existing `useTableExpandedState` hook (the file's final block):

```tsx
import type {OnChangeFn, ExpandedState} from '@gravity-ui/table/tanstack';

// ... existing exports ...

/**
 * Bridge TanStack's `onExpandedChange` back into this provider's persisted state.
 * Returns a stable setter compatible with `useTable({ onExpandedChange })`.
 */
export function useSetExpandedFromContext(): OnChangeFn<ExpandedState> {
  const {setState} = useCollapsibleStateContext();
  return React.useCallback<OnChangeFn<ExpandedState>>(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (next === true) {
          // ExpandedState can be `true` (expand all). The context only
          // persists records; in practice TanStack only emits `true`
          // when the consumer calls toggleAllRowsExpanded(true), which
          // we route through expandAll instead. Safe no-op fallback.
          return prev;
        }
        return next as Record<string, boolean>;
      });
    },
    [setState],
  );
}
```

If `OnChangeFn` / `ExpandedState` are already imported, just add to the existing import.

- [ ] **Step 2: Run typecheck**

Run: project typecheck (e.g., `npm run lint` or equivalent).
Expected: clean.

### Task C.3: Migrate `TreeExpandableCell` to library hooks

**Files:**

- Modify: `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/TreeExpandableCell.tsx`

- [ ] **Step 1: Replace the imports and hook calls**

Open the file. Replace the entire body with:

```tsx
import * as React from 'react';

import {withNaming} from '@bem-react/classname';
import type {Row} from '@gravity-ui/table/tanstack';
import {useIsExpanded} from '@gravity-ui/table';
import {ArrowToggle, Button, Flex} from '@gravity-ui/uikit';

import type {QuotasTable3Row} from '../../types';

export const NAMESPACE = 'gt-';

export const block = withNaming({n: NAMESPACE, e: '__', m: '_'});

const b = block('styled-table');

export interface TreeExpandableCellProps extends React.PropsWithChildren {
  row: Row<QuotasTable3Row>;
}

export function TreeExpandableCell({row, children}: TreeExpandableCellProps) {
  const expanded = useIsExpanded(row);

  const handleButtonClick = React.useCallback(() => {
    row.toggleExpanded();
  }, [row]);

  return (
    <Flex alignItems="center">
      <Button
        className={b('expanding-control', {visible: row.getCanExpand()})}
        view="flat"
        size="s"
        onClick={handleButtonClick}
      >
        <Button.Icon>
          <ArrowToggle direction={expanded ? 'bottom' : 'right'} size={16} />
        </Button.Icon>
      </Button>
      {children}
    </Flex>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: project typecheck.
Expected: clean. (No more imports from `../../collapsibleStateContext`.)

### Task C.4: Wire `onExpandedChange` into `useTable` in `QuotasTable3.tsx`

**Files:**

- Modify: `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx`

- [ ] **Step 1: Import the new bridge hook**

In `QuotasTable3.tsx`, update the import from `./collapsibleStateContext`:

```tsx
import {useSetExpandedFromContext, useTableExpandedState} from './collapsibleStateContext';
```

- [ ] **Step 2: Use the bridge in `useTable`**

Inside `QuotasTable`, after `const expanded = useTableExpandedState();`, add:

```tsx
const onExpandedChange = useSetExpandedFromContext();
```

In the `useTable({...})` call, add `onExpandedChange,` next to `onColumnVisibilityChange`:

```tsx
const table = useTable<QuotasTable3Row>({
  columns,
  data: tableData,
  enableExpanding: true,
  getSubRows,
  getRowId,
  onColumnVisibilityChange: setVisibilityState,
  onExpandedChange,
  state: {
    expanded,
    columnPinning: defaultColumnPinning,
    columnVisibility: visibilityState,
  },
});
```

- [ ] **Step 3: Run typecheck**

Run: project typecheck.
Expected: clean.

### Task C.5: Trim dead code from `collapsibleStateContext.tsx`

**Files:**

- Modify: `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx`

- [ ] **Step 1: Verify no remaining consumers**

Run from arcadia root:

```bash
grep -rn "useRowExpandedState\|useToggleRowState" \
    src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/
```

Expected: zero matches outside the file you're about to edit. If any match remains, that file needs the same migration as Task C.3 before deletion.

- [ ] **Step 2: Remove the dead exports and their helpers**

In `collapsibleStateContext.tsx`:

1. Delete the `useRowExpandedState` export (lines 126-130 in the spec snapshot).
2. Delete the `useToggleRowState` export (lines 132-138).
3. Inside `CollapsibleStateContextProvider`, delete `getLocalState`, `toggleState`, and `stateRef` (they were only consumed by the removed hooks).
4. Update `CollapsibleStateContextShape` to drop `getLocalState` and `toggleState`. Final shape:

```tsx
export interface CollapsibleStateContextShape {
  state: Record<string, boolean>;
  setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandAll: () => void;
  collapseAll: () => void;
}
```

5. Update the `contextValue` `useMemo` to omit the dropped fields:

```tsx
const contextValue = React.useMemo(
  () => ({state, setState, expandAll, collapseAll}),
  [state, expandAll, collapseAll],
);
```

- [ ] **Step 3: Run typecheck**

Run: project typecheck.
Expected: clean. If anything imports the removed hooks, you missed a consumer in Step 1 — fix it first.

- [ ] **Step 4: Commit C.2–C.5 together**

```bash
git add src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.tsx \
        src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/TreeExpandableCell.tsx \
        src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx
git commit -m "perf(QuotasTable3): route expansion through table hooks; drop fanout context paths"
```

### Task C.6: Profile-verify the win

- [ ] **Step 1: Bump `@gravity-ui/table`**

Bump the dependency in arcadia to the version that ships Phases L1–L4. Use the arcadia repo's standard upgrade workflow.

- [ ] **Step 2: Open the page in dev mode**

Run the arcadia dev server and navigate to the Quotas page that renders `QuotasTable3`.

- [ ] **Step 3: Profile a single expand toggle**

In React DevTools → Profiler:

1. Enable "Record why each component rendered".
2. Click "Record".
3. Click the expander on one provider row.
4. Stop recording.

**Expected commits:**

- `QuotasTable` (state changed; owns the table)
- The toggled row (its `isExpanded` flipped)
- The newly visible children rows (didn't exist before)

**NOT expected:** every other row in the table.

- [ ] **Step 4: Console check**

In the browser dev console, search for `[gravity-ui/table]`. Zero warnings expected. Any warning names a specific prop — cross-reference with `docs/MIGRATION-experimentalMemoization.md` and fix.

- [ ] **Step 5: Smoke-test expand-all / collapse-all**

On `QuotasPageV2` (the same page), click the expand-all and collapse-all buttons. Both must still work — they go through `useGlobalExpandCollapseActions` → `expandAll` / `collapseAll`, which Task C.5 preserved.

- [ ] **Step 6: Open a PR**

In arcadia, push a PR with the commits from C.0–C.5 and a body referencing the spec at `gravity-ui/table:docs/superpowers/specs/2026-04-27-experimental-memoization-real-world-design.md` and including a before/after profiler screenshot.

---

## Done

When all phases land:

- Library: `MemoBaseCell` is wired into `BaseRow`, dev warnings catch unstable props, the storybook anti-pattern story exists, and the migration doc is published.
- Consumer: `QuotasTable3` profiles cleanly — only the toggled row + its new children commit on expand toggles. Zero stability warnings in console.
