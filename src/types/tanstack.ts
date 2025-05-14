import type {
    Cell as BaseCell,
    Column as BaseColumn,
    ColumnDef as BaseColumnDef,
    Header as BaseHeader,
    RowData,
} from '@tanstack/react-table';

export type ColumnDef<TData extends RowData, TValue = unknown> = BaseColumnDef<TData, TValue> & {
    /* Show indents depending on row depth */
    withNestingStyles?: boolean;
    /* Show vertical lines indicating depth in tree */
    showTreeDepthIndicators?: boolean;
};

export interface Column<TData extends RowData, TValue = unknown>
    extends Omit<BaseColumn<TData, TValue>, 'columnDef'> {
    columnDef: ColumnDef<TData, TValue>;
}

export interface Cell<TData extends RowData, TValue>
    extends Omit<BaseCell<TData, TValue>, 'column'> {
    column: Column<TData, TValue>;
}

export interface Header<TData extends RowData, TValue>
    extends Omit<BaseHeader<TData, TValue>, 'column'> {
    column: Column<TData, TValue>;
}
