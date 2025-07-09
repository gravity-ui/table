# experimentalUseColumnsAutoSize

A React hook for automatically calculating column widths based on content, while supporting:

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

## API Reference

### experimentalUseColumnsAutoSize

#### Arguments

| Name                                  | Type                                   | Required | Description                                                                                                                                                                                                       |
| ------------------------------------- | -------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`                             | `ColumnDef<TData, any>[]`              | Yes      | The column definitions for your table                                                                                                                                                                             |
| `options`                             | `object`                               | No       | Configuration options (see below)                                                                                                                                                                                 |
| `experimentalRenderElementForMeasure` | `(element?: ReactNode) => JSX.Element` | No       | Provide a custom renderer for measurement if you need some custom logic for your cells (for example context providers), you can use the default experimentalRenderElementForMeasure from @gravity-ui/table inside |

#### Options

| Name                    | Type      | Default | Description                                                                                   |
| ----------------------- | --------- | ------- | --------------------------------------------------------------------------------------------- |
| `minWidth`              | `number`  | `50`    | Minimum width in pixels for any column                                                        |
| `maxWidth`              | `number`  | `500`   | Maximum width in pixels for any column                                                        |
| `padding`               | `number`  | `16`    | Padding in pixels to add to content width for cells                                           |
| `headerPadding`         | `number`  | `24`    | Padding in pixels to add to content width for headers                                         |
| `sampleSize`            | `number`  | `100`   | Number of rows to sample for width calculation (helps with performance)                       |
| `measureHeaderText`     | `boolean` | `true`  | Whether to include header text in width calculation                                           |
| `respectExistingWidths` | `boolean` | `true`  | Whether to preserve columns with predefined widths (size, width, or matching minSize/maxSize) |
| `respectResizedWidths`  | `boolean` | `true`  | Whether to preserve column widths that were resized by the user                               |

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
5. **Reactivity**: Automatically updates when table data or columns change.

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
