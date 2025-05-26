import type {
    Cell as BaseCell,
    Column as BaseColumn,
    ColumnDef as BaseColumnDef,
    Header as BaseHeader,
    HeaderGroup as BaseHeaderGroup,
    RowData,
    TableOptions,
} from '@tanstack/react-table';

export type ColumnDef<TData extends RowData, TValue = unknown> = BaseColumnDef<TData, TValue> & {
    /* Show indents depending on row depth */
    withNestingStyles?: boolean;
    /* Show vertical lines indicating depth in tree */
    showTreeDepthIndicators?: boolean;
};

export type DefinedColumnDef<TData extends RowData, TValue = unknown> = Omit<
    ColumnDef<TData, TValue>,
    'defaultDisplayColumn' | 'id'
> & {
    defaultDisplayColumn: Partial<ColumnDef<TData, TValue>>;
    id: string;
};

export interface Column<TData extends RowData, TValue = unknown>
    extends Omit<BaseColumn<TData, TValue>, 'columnDef' | 'columns'> {
    columnDef: ColumnDef<TData, TValue>;
    columns: Column<TData, TValue>[];
}

export interface Cell<TData extends RowData, TValue = unknown>
    extends Omit<BaseCell<TData, TValue>, 'column'> {
    column: Column<TData, TValue>;
}

export interface Header<TData extends RowData, TValue = unknown>
    extends Omit<BaseHeader<TData, TValue>, 'column'> {
    column: Column<TData, TValue>;
}

export type HeaderGroup<TData extends RowData> = Omit<BaseHeaderGroup<TData>, 'headers'> & {
    headers: Header<TData>[];
};

interface PassedTableOptions<TData>
    extends Omit<TableOptions<TData>, 'getCoreRowModel' | 'columns'> {
    getCoreRowModel?: TableOptions<TData>['getCoreRowModel'];
    columns: ColumnDef<TData, any>[];
}

export interface UseTableOptions<TData> extends PassedTableOptions<TData> {}
