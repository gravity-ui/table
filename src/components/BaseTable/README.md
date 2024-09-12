# BaseTable

## Properties

| Name                        | Description                                                                                       | Type                                                                                                                                                                                                           |
| :-------------------------- | :------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| table (required)            | The table instance returned from the `useTable` hook                                              | `Table<TData>`                                                                                                                                                                                                 |
| attributes                  | HTML attributes for the `<table>` element                                                         | `React.TableHTMLAttributes<HTMLTableElement>`                                                                                                                                                                  |
| bodyAttributes              | HTML attributes for the `<tbody>` element                                                         | `React.HTMLAttributes<HTMLTableSectionElement>`                                                                                                                                                                |
| bodyClassName               | CSS classes for the `<tbody>` element                                                             | `string`                                                                                                                                                                                                       |
| cellAttributes              | HTML attributes for the `<td>` elements inside `<tbody>`                                          | `React.TdHTMLAttributes<HTMLTableCellElement>`<br>`((cell?: Cell<TData, unknown>) => React.TdHTMLAttributes<HTMLTableCellElement>)`                                                                            |
| cellClassName               | CSS classes for the `<td>` elements inside `<tbody>`                                              | `string`<br>`((cell?: Cell<TData, unknown>) => string)`                                                                                                                                                        |
| className                   | CSS classes for the `<table>` element                                                             | `string`                                                                                                                                                                                                       |
| emptyContent                | Content displayed when the table has no data rows                                                 | `React.ReactNode`<br>`(() => React.ReactNode)`                                                                                                                                                                 |
| footerAttributes            | HTML attributes for the `<tfoot>` element                                                         | `React.HTMLAttributes<HTMLTableSectionElement>`                                                                                                                                                                |
| footerCellAttributes        | HTML attributes for the `<th>` elements inside `<tfoot>`                                          | `React.ThHTMLAttributes<HTMLTableCellElement>`<br>`((header: Header<TData, TValue>) => React.ThHTMLAttributes<HTMLTableCellElement>)`                                                                          |
| footerCellClassName         | CSS classes for the `<th>` elements inside `<tfoot>`                                              | `string`<br>`((header: Header<TData, TValue>) => string)`                                                                                                                                                      |
| footerClassName             | CSS classes for the `<tfoot>` element                                                             | `string`                                                                                                                                                                                                       |
| footerRowAttributes         | HTML attributes for the `<tr>` elements inside `<tfoot>`                                          | `React.HTMLAttributes<HTMLTableRowElement>`<br>`((footerGroup: HeaderGroup<TData>) => React.HTMLAttributes<HTMLTableRowElement>)`                                                                              |
| footerRowClassName          | CSS classes for the `<tr>` elements inside `<tfoot>`                                              | `string`                                                                                                                                                                                                       |
| getGroupTitle               | Returns the title for a group header row                                                          | `(row: Row<TData>) => React.ReactNode`                                                                                                                                                                         |
| getIsCustomRow              | Checks if the row is custom and should be rendered using `renderCustomRowContent`                 | `(row: Row<TData>) => boolean`                                                                                                                                                                                 |
| getIsGroupHeaderRow         | Checks if the row should be rendered as a group header                                            | `(row: Row<TData>) => boolean`                                                                                                                                                                                 |
| groupHeaderClassName        | CSS classes for the group header elements                                                         | `string`                                                                                                                                                                                                       |
| headerAttributes            | HTML attributes for the `<thead>` element                                                         | `React.HTMLAttributes<HTMLTableSectionElement>`                                                                                                                                                                |
| headerCellAttributes        | HTML attributes for the `<th>` elements inside `<thead>`                                          | `React.ThHTMLAttributes<HTMLTableCellElement>`<br>`((header: Header<TData, TValue>, parentHeader?: Header<TData, unknown>) => React.ThHTMLAttributes<HTMLTableCellElement>)`                                   |
| headerCellClassName         | CSS classes for the `<th>` elements inside `<thead>`                                              | `string`<br>`((header: Header<TData, TValue>, parentHeader?: Header<TData, unknown>) => string)`                                                                                                               |
| headerClassName             | CSS classes for the `<thead>` element                                                             | `string`                                                                                                                                                                                                       |
| headerRowAttributes         | HTML attributes for the `<tr>` elements inside `<thead>`                                          | `React.HTMLAttributes<HTMLTableRowElement>`<br>`((headerGroup: HeaderGroup<TData>, parentHeaderGroup?: HeaderGroup<TData>) => React.HTMLAttributes<HTMLTableRowElement>)`                                      |
| headerRowClassName          | CSS classes for the `<tr>` elements inside `<thead>`                                              | `string`<br>`((headerGroup: HeaderGroup<TData>, parentHeaderGroup?: HeaderGroup<TData>) => string)`                                                                                                            |
| onRowClick                  | Click handler for rows inside `<tbody>`                                                           | `(row: Row<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void`                                                                                                                                      |
| renderCustomRowContent      | Function to render custom rows                                                                    | `(props: {row: Row<TData>; Cell: React.FunctionComponent<BaseCellProps<TData>>; cellClassName?: BaseCellProps<TData>['className']}) => React.ReactNode`                                                        |
| renderGroupHeader           | Function to override the default rendering of group headers                                       | `(props: {row: Row<TData>; className?: string; getGroupTitle?: (row: Row<TData>) => React.ReactNode}) => React.ReactNode`                                                                                      |
| renderGroupHeaderRowContent | Function to override the default rendering of the entire group header row                         | `(props: {row: Row<TData>; Cell: React.FunctionComponent<BaseCellProps<TData>>; cellClassName?: BaseCellProps<TData>['className']; getGroupTitle?: (row: Row<TData>) => React.ReactNode;}) => React.ReactNode` |
| renderResizeHandle          | Function to override the default rendering of resize handles                                      | `(props: {header: Header<TData, TValue>; className?: string}) => React.ReactNode`                                                                                                                              |
| renderSortIndicator         | Function to override the default rendering of sort indicators                                     | `(props: {header: Header<TData, TValue>; className?: string}) => React.ReactNode`                                                                                                                              |
| resizeHandleClassName       | CSS classes for resize handles in `<th>` elements                                                 | `string`                                                                                                                                                                                                       |
| rowAttributes               | HTML attributes for `<tr>` elements inside `<tbody>`                                              | `React.HTMLAttributes<HTMLTableRowElement>`<br>`((row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>)`                                                                                              |
| rowClassName                | CSS classes for `<tr>` elements inside `<tbody>`                                                  | `string`<br>`((row?: Row<TData>) => string)`                                                                                                                                                                   |
| rowVirtualizer              | The row virtualizer instance returned from `useRowVirtualizer` or `useWindowRowVirtualizer` hooks | `Virtualizer<TScrollElement, HTMLTableRowElement>`                                                                                                                                                             |
| sortIndicatorClassName      | CSS classes for the sort indicator inside `<th>` elements                                         | `string`                                                                                                                                                                                                       |
| stickyFooter (`= false`)    | Makes the `<tfoot>` element sticky                                                                | `boolean`                                                                                                                                                                                                      |
| stickyHeader (`= false`)    | Makes the `<thead>` element sticky                                                                | `boolean`                                                                                                                                                                                                      |
| withFooter (`= false`)      | Determines whether the `<tfoot>` element should be rendered                                       | `boolean`                                                                                                                                                                                                      |
| withHeader (`= true`)       | Determines whether the `<thead>` element should be rendered                                       | `boolean`                                                                                                                                                                                                      |