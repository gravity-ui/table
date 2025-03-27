import type {
    Cell as BaseCell,
    Column as BaseColumn,
    ColumnDef as BaseColumnDef,
    Header as BaseHeader,
} from '@tanstack/react-table';

export type ColumnDef<TData, TValue = unknown> = BaseColumnDef<TData, TValue> & {
    /* Show indents depending on row depth */
    withNestingStyles?: boolean;
    /* Show vertical lines indicating depth in tree */
    showTreeDepthIndicators?: boolean;
};

export type Column<TData, TValue> = BaseColumn<TData, TValue> & {
    columnDef: ColumnDef<TData, TValue>;
};

export type Cell<TData, TValue> = BaseCell<TData, TValue> & {
    column: Column<TData, TValue>;
};

export type Header<TData, TValue> = BaseHeader<TData, TValue> & {
    column: Column<TData, TValue>;
};

export type TableSize = 's' | 'm';
