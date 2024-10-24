import type {Column, RowData} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        hideInSettings?: boolean;
        inSettings?: ((column: Column<TData, TValue>) => string | React.ReactNode) | string;
    }
}
