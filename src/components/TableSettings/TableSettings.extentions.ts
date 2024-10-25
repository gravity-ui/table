import type {Column, RowData} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        hideInSettings?: boolean;
        titleInSettings?: ((column: Column<TData, TValue>) => React.ReactNode) | React.ReactNode;
    }
}
