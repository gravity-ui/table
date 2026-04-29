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
