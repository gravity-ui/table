import type {RowData} from '@tanstack/react-table';

import type {Column} from '../../types/tanstack';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        hideInSettings?: boolean;
        titleInSettings?: ((column: Column<TData, TValue>) => React.ReactNode) | React.ReactNode;
    }
}
