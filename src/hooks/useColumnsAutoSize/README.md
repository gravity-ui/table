# experimentalUseColumnsAutoSize

A React hook that automatically calculates column widths based on measured content, supporting primitives and React nodes, `accessorKey`/`accessorFn` columns, custom cell renderers, and respect for predefined or user-resized widths.

It also handles:

- Both primitive values and React nodes
- Columns defined with accessorKey or accessorFn
- Custom cell renderers
- User resizing behavior
- Predefined column widths

## Features

- 🔍 **Smart Content Detection**: Accurately measures width of text, numbers, and React components
- 🧠 **Intelligent Width Calculation**: Sets optimal column widths based on content
- 🖱️ **Resize Support**: Respects user-resized columns
- ⚙️ **Highly Configurable**: Customize min/max widths, padding, and sampling size
- 🔄 **Compatibility**: Works with all TanStack Table v8 features

## Usage

### Basic Example

```tsx
import {useTable, experimentalUseColumnsAutoSize, ColumnDef} from '@gravity-ui/table';

function MyTable({data}) {
  // Define your columns
  const columns = React.useMemo<ColumnDef<MyData>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: 'Status',
        cell: (info) => (
          <div className={`status-badge status-${info.getValue()}`}>{info.getValue()}</div>
        ),
      },
    ],
    [],
  );

  // Calculate column widths
  const {setTableInstance, columnsWithAutoSizes} = experimentalUseColumnsAutoSize({
    columns,
    options: {
      minWidth: 80,
      maxWidth: 300,
    },
  });

  // Create table instance
  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    enableColumnResizing: true,
  });

  // Update table instance reference
  React.useEffect(() => {
    setTableInstance(table);
  }, [table, setTableInstance]);

  // Render your table
}
```

### With Resizable Columns

```tsx
const table = useTable({
  data,
  columns: columnsWithAutoSizes,
  // Enable column resizing
  enableColumnResizing: true,
  columnResizeMode: 'onChange', // or 'onEnd'
});
```

## Properties

### experimentalUseColumnsAutoSize

#### Arguments

| Name                                  | Type                                   | Required | Description                                                                                                                                                                                                       |
| ------------------------------------- | -------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`                             | `ColumnDef<TData, any>[]`              | Yes      | The column definitions for your table                                                                                                                                                                             |
| `options`                             | `object`                               | No       | Configuration options (see below)                                                                                                                                                                                 |
| `experimentalRenderElementForMeasure` | `(element?: ReactNode) => JSX.Element` | No       | Provide a custom renderer for measurement if you need some custom logic for your cells (for example context providers), you can use the default experimentalRenderElementForMeasure from @gravity-ui/table inside |

#### Options

| Name                    | Type      | Default | Description                                                                                                                                                           |
| ----------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minWidth`              | `number`  | `50`    | Minimum width in pixels for any column                                                                                                                                |
| `maxWidth`              | `number`  | `500`   | Maximum width in pixels for any column                                                                                                                                |
| `padding`               | `number`  | `16`    | Padding in pixels to add to content width for cells                                                                                                                   |
| `headerPadding`         | `number`  | `24`    | Padding in pixels to add to content width for headers                                                                                                                 |
| `sampleSize`            | `number`  | `100`   | Number of rows to sample for width calculation (helps with performance)                                                                                               |
| `measureHeaderText`     | `boolean` | `true`  | Whether to include header text in width calculation                                                                                                                   |
| `respectExistingWidths` | `boolean` | `true`  | Whether to preserve columns with predefined widths (size, width, or matching minSize/maxSize)                                                                         |
| `respectResizedWidths`  | `boolean` | `true`  | Whether to preserve column widths that were resized by the user                                                                                                       |
| `measureOnce`           | `boolean` | `false` | If `true`, widths are not recalculated when data changes, columns are removed, or columns are reordered. Adding a previously unmeasured column triggers recalculation |

#### Returns

| Name                   | Type                                    | Description                                                                                                                                                |
| ---------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columnWidths`         | `Record<string, number>`                | An object mapping column IDs to their calculated widths in pixels                                                                                          |
| `isMeasuring`          | `boolean`                               | A flag, which is true while the column widths are calculating (maybe you want to hide the table and show the loader in this case to avoid columns jumping) |
| `columnsWithAutoSizes` | `TData[]`                               | The column definitions with auto sizes                                                                                                                     |
| `setTableInstance`     | `(tableInstance: Table<TData>) => void` | The table instance state setter, use the `useTable` return value to set this state                                                                         |

## Usage Example

```tsx
const {columnWidths, isMeasuring, columnsWithAutoSizes, setTableInstance} = useAutoColumnWidth({
  columns,
  options: {
    minWidth: 80,
    maxWidth: 300,
    sampleSize: 50,
  },
});
```

## How It Works

1. **Measurement**: The hook creates an invisible container to measure the content width of each cell.
2. **Sampling**: To optimize performance, it only samples a subset of rows (configurable via `sampleSize`).
3. **Optimization**: Different measuring techniques are used for text vs React components.
4. **Respect for User Actions**: Preserves user-resized column widths and pre-defined column widths.
5. **Reactivity**: Automatically updates when table data or columns change. With `measureOnce`, only adding a previously unmeasured column triggers recalculation.

## Troubleshooting

### Columns are too narrow or too wide

Adjust the `padding`, `minWidth` and `maxWidth` options to fine-tune the calculations.

```tsx
experimentalUseColumnsAutoSize({
  columns,
  options: {
    minWidth: 100, // Increase minimum width
    padding: 24, // Add more padding
    maxWidth: 400, // Adjust maximum width
  },
});
```

### Performance issues with large datasets

Reduce the `sampleSize` to improve performance:

```tsx
experimentalUseColumnsAutoSize({
  columns,
  options: {
    sampleSize: 20, // Only measure the first 20 rows
  },
});
```

### Conflicts with manually specified column widths

If you want certain columns to keep their specified widths, set `respectExistingWidths` to true:

```tsx
experimentalUseColumnsAutoSize({
  columns,
  options: {
    respectExistingWidths: true,
  },
});
```

### Columns jump / resize when sorting or changing data

By default the hook recalculates widths whenever the data changes (including sorting, since the sampled rows change). To keep widths stable unless a previously unmeasured column is added, enable `measureOnce`:

```tsx
experimentalUseColumnsAutoSize({
  columns,
  options: {
    measureOnce: true, // recalculate only when a previously unmeasured column is added
  },
});
```

### Some providers needed inside the cells (for example the redux provider)

If you want certain columns to keep their specified widths, set `respectExistingWidths` to true:

```tsx
import {experimentalRenderElementForMeasure as defaultRenderElementForMeasure} from '@gravity-ui/table';
import {Provider} from 'react-redux';

function experimentalRenderElementForMeasure(element?: ReactNode) {
  return <Provider store={store}>{defaultRenderElementForMeasure(element)}</Provider>;
}

experimentalUseColumnsAutoSize({
  columns,
  experimentalRenderElementForMeasure,
});
```

### Controlled auto widths

Pass `columnWidths` and `onChangeColumnWidths` to keep measured widths in the owner
of a table. Updated `columnWidths` props are applied on every render. Without both
props, the hook manages widths internally; an optional `onChangeColumnWidths`
callback still receives updates in uncontrolled mode.

```tsx
const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
const {columnsWithAutoSizes, setTableInstance, isMeasuring} = experimentalUseColumnsAutoSize({
  columns,
  columnWidths,
  onChangeColumnWidths: setColumnWidths,
  options: {measureOnce: true},
});
```

Keep this state above the subtree that unmounts to preserve measured widths.
When all columns have valid controlled or predefined widths, `isMeasuring` is false
on the first render, even without rows. With `measureOnce`, only missing widths
are measured. Removed columns and invalid widths are excluded. User-resized
TanStack `columnSizing` and predefined widths retain priority over auto widths.
Callbacks are emitted for changes, not simply because the table mounts or a
callback prop changes. The callback requests an update in controlled mode: only
new `columnWidths` props change the rendered widths.

### Lightweight measurement through column configuration

Describe a column's visible text in `meta.autoSize` to measure it without mounting
its React cell renderer. No DOM or measurement-renderer callback is required:

```tsx
import type {ColumnAutoSize} from '@gravity-ui/table';

const columns = React.useMemo<ColumnDef<Item>[]>(
  () => [
    {
      id: 'duration',
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({getValue}) => <ExpensiveInteractiveCell value={getValue<number>()} />,
      meta: {
        autoSize: {
          text: (value) => (typeof value === 'number' ? formatDuration(value) : '–'),
          extraWidth: 24, // space occupied by the cell's icon/button
        } satisfies ColumnAutoSize<Item>,
      } as ColumnDef<Item>['meta'],
    },
  ],
  [],
);
```

`meta.autoSize: {}` measures the accessor's primitive value. Optional fields:

- `text`: formatted text, or `(value, row) => text`. Share formatting with the real cell.
- `extraWidth`: reserved space in px or a CSS length expression, optionally a function
  of `(value, row)` for controls that are absent in empty cells.
- `style` and `className`: typography/cell styles and the text class, either static
  or functions of `(value, row)`. Numeric CSS lengths use React's px semantics.
- `header`: text or `{text, extraWidth?, style?, className?}` for a custom React header.
  String/number headers are inferred automatically.
- `footer`: an array of text values or the same text descriptions for footer rows.

The library creates lightweight DOM, inserts all described columns together,
reads once per column and removes the batch. It uses the styled table's cell and
header classes. `padding` and `headerPadding` supply horizontal spacing; cell
`style` can override it. Columns without a description, unsupported values,
custom React headers without a text description and broken formatters keep the
existing React measurement path. Visible cell rendering is unchanged.

Optional hook arguments:

- `measurementContainerRef`: inherit fonts/theme variables from the table's parent;
  attach this ref even while showing a loader. Defaults to `document.body`.
- `measurementClassName`: additional table classes for the temporary container.
- `measurementRevision`: a stable theme/style revision. Changing it refreshes even
  `measureOnce` widths. Font loading triggers a refresh automatically.

Register the table using `React.useLayoutEffect(() => setTableInstance(table),
[table, setTableInstance])` to measure before paint. Sampling uses the current
sorted/filtered row model. Predefined widths, user resizing, controlled widths and
`measureOnce` retain their priority. No width cache is shared between mounts.

`options.deferUpdates` defaults to `false`. Enable it to let React 18+ interrupt
rendering real cells after measurement. React 17 applies updates normally. DOM
measurement stays synchronous, so very large samples can still block the thread.

### Measurement lifecycle and invalidation

Only positive layout widths are committed. Hidden or detached containers defer
measurement and retry when layout/visibility changes; they do not finalize
`measureOnce` at `minWidth`. CSS layout widths are used rather than transformed
client rectangles, so an ancestor's `transform: scale(...)` does not change sizing.
Empty tables finish loading and can size headers/footers. Header-only widths are
refreshed when the first data arrives, even with `measureOnce`.

Descriptions on leaf columns inside groups are supported. Equivalent column
arrays, options and controlled-width records are compared structurally. Formatter
functions are compared by identity: use stable callbacks when their behavior has
not changed. `measurementRevision` accepts a string, number, boolean or null; use
a primitive version key rather than an object literal for external style changes.

DOM descriptions are measured synchronously. In a mixed table their widths can
update immediately, but `isMeasuring` waits for the remaining React columns.
React fallback requests retain the 100 ms debounce and stale results are ignored.
Without a header or nonempty content, the existing default cell width is used.
Resetting TanStack column sizing measures the latest data again rather than
promoting a user's manual width to an automatic width.

Measurement inherits the table's header, body, row and footer classes. Arbitrary
custom DOM layouts still need a matching text/style description or React fallback.
Broken text formatters and unsupported values produce a development warning before
falling back. The numeric-style utility follows the linked React unitless-property
list; it does not run React renderers during DOM measurement.

### Column IDs and manual sizing

Columns without `meta.autoSize` retain their existing width keys: explicit ID or
accessor key, without normalization or a header fallback. Described DOM columns
use TanStack IDs: `a.b` becomes `a_b` unless an explicit ID is provided.
Nested columns are traversed only when DOM measurement is enabled.

When any column enables `meta.autoSize`, automatic widths initialize `size`
without raising `minSize` for the entire table, including columns measured through
the React fallback. Manual resizing may shrink below the measured width immediately,
subject to explicit column `minSize`/`maxSize`. Tables without any `meta.autoSize`
retain the legacy auto-minimum behavior. Hook `minWidth`/`maxWidth` constrain
automatic measurements, not manual resizing.

The Storybook **DOMMeasurementRegressionCase** has a browser regression test that
compares widths with cloned real rendered cells in Arial, including copy buttons
and footers, hidden mounting, ancestor scale and empty-to-data transitions.

The library does not augment TanStack `ColumnMeta`. Type descriptions explicitly
with `satisfies ColumnAutoSize<Item>` (exported by this package) for validation and
formatter autocomplete. Existing application metadata declarations are unaffected.
