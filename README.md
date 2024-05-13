# @gravity-ui/table &middot; [![npm package](https://img.shields.io/npm/v/@gravity-ui/table)](https://www.npmjs.com/package/@gravity-ui/table) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/table/.github/workflows/ci.yml?label=CI&logo=github)](https://github.com/gravity-ui/table/actions/workflows/ci.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685)](https://preview.gravity-ui.com/table/)

## Install

```shell
npm install --save @gravity-ui/table
```

## Usage

```tsx
import {Table, TableProps} from '@gravity-ui/table';

interface Person {
  id: string;
  name: string;
  age: number;
}

const data: Person[] = [
  {
    id: 'name',
    name: 'John',
    age: 23,
  },
  {
    id: 'age',
    name: 'Michael',
    age: 27,
  },
];

const columns: TableProps<Person>['columns'] = [
  {accessorKey: 'name', header: 'Name', size: 100},
  {accessorKey: 'age', header: 'Age', size: 100},
];

<Table data={data} columns={columns} getRowId={(person) => person.id} />;
```

### With selection

```tsx
const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

<Table selectedIds={selectedIds} onSelectedChange={setSelectedIds} {...props} />;
```

### Sorting

Learn about the column properties in the react-table [docs](https://tanstack.com/table/v8/docs/guide/sorting)

```tsx
const [sorting, setSorting] = React.useState<NonNullable<TableProps<ItemType>['sorting']>>([]);

<Table enableSorting sorting={sorting} onSortingChange={setSorting} {...props} />;
```

If you want to sort the elements manually pass `manualSorting` property.

### Grouping

```tsx
type ItemType = PersonGroup | Person;

interface PersonGroup {
  id: string;
  name: string;
  items: Person[];
}

const columns: TableProps<ItemType>['columns'] = [
  {accessorKey: 'name', header: 'Name', size: 200},
  {accessorKey: 'age', header: 'Age', size: 100},
];

const data: ItemType[] = [
  {
    id: 'friends',
    name: 'Friends',
    items: [
      {id: 'nick', name: 'Nick', age: 25},
      {id: 'tom', name: 'Tom', age: 21},
    ],
  },
  {
    id: 'relatives',
    name: 'Relatives',
    items: [
      {id: 'john', name: 'John', age: 23},
      {id: 'michael', name: 'Michael', age: 27},
    ],
  },
];

const getSubRows = (item: ItemType) => ('items' in item ? item.items : undefined);
const getGroupTitle: TableProps<ItemType>['getGroupTitle'] = (row) => row.getValue('name');
const getRowId = (item: ItemType) => item.id;

const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

<Table<ItemType>
  data={data}
  columns={columns}
  getSubRows={getSubRows}
  getGroupTitle={getGroupTitle}
  getRowId={getRowId}
  expandedIds={expandedIds}
  onExpandedChange={setExpandedIds}
  {...props}
/>;
```

### Reordering

```tsx
const TableWithReordering = withTableReorder(Table);

const [data, setData] = React.useState(props.data);

const handleReorder = React.useCallback(
  ({draggedItemKey, baseItemKey}: SortableListDragResult) => {
    setData((data) => {
      const dataClone = data.slice();
      const index = dataClone.findIndex((item) => getRowId(item) === draggedItemKey);

      if (index >= 0) {
        const dragged = dataClone.splice(index, 1)[0]!;
        const insertIndex = dataClone.findIndex((value) => getRowId(value) === baseItemKey);

        if (insertIndex >= 0) {
          dataClone.splice(insertIndex + 1, 0, dragged);
        } else {
          dataClone.unshift(dragged);
        }
      }

      return dataClone;
    });
  },
  [getRowId],
);

<TableWithReordering<ItemType> data={data} onReorder={handleReorder} {...props} />;
```

Or use reordering provider

```tsx
<ReorderingProvider
  data={data}
  getRowId={getRowId}
  onReorder={onReorder}
  dndModifiers={dndModifiers}
  nestingEnabled={nestingEnabled}
  getSubRows={getSubRows}
  expandedIds={expandedIds}
>
  <Table {...props} />
</ReorderingProvider>
```

### Virtualization

Use if you want to use grid container as the scroll element (if you want to use window see window virtualization section).

```tsx
const TableWithVirtualization = withTableVirtualization(Table);

const rowHeight = 20;
const estimateRowSize = () => rowHeight;

<TableWithVirtualization<ItemType>
  estimateRowSize={estimateRowSize}
  overscanRowCount={5}
  containerHeight="90vh"
  {...props}
/>;
```

Or use virtualization provider

```tsx
const rowHeight = 20;
const estimateRowSize = () => rowHeight;

<VirtualizationProvider
  rowsCount={props.data.length}
  overscanRowCount={5}
  containerClassName={containerClassName}
  estimateRowSize={estimateRowSize}
  containerHeight="90vh"
>
  <Table {...props} />
</VirtualizationProvider>;
```

### Window virtualization

Use if you want to use window as the scroll element

```tsx
const TableWithVirtualization = withTableWindowVirtualization(Table);

const rowHeight = 20;
const estimateRowSize = () => rowHeight;

<TableWithVirtualization<ItemType>
  estimateRowSize={estimateRowSize}
  overscanRowCount={5}
  {...props}
/>;
```

Or use window virtualization provider

```tsx
const rowHeight = 20;
const estimateRowSize = () => rowHeight;

<WindowVirtualizationProvider
  rowsCount={props.data.length}
  overscanRowCount={5}
  containerClassName={containerClassName}
  estimateRowSize={estimateRowSize}
>
  <Table {...props} />
</WindowVirtualizationProvider>;
```

### Resizing

```tsx
<Table
  enableColumnResizing
  columnResizeMode="onChange"
  columnResizeDirection="ltr"
  onColumnSizingChange={handleColumnSizingChange}
  onColumnSizingInfoChange={handleColumnSizingInfoChange}
  {...props}
/>
```

Learn more about the table and the column resizing properties in the react-table [docs](https://tanstack.com/table/v8/docs/api/features/column-sizing)
