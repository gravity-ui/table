import React from 'react';

import type {Row, TableState} from '@tanstack/react-table';

export interface TableContextProps {
    getRowByIndex: <TData>(index: number) => Row<TData> | undefined;
    enableNesting?: boolean;
    getTableState: () => TableState;
}

export const TableContext = React.createContext<TableContextProps>({
    getRowByIndex: () => undefined,
    enableNesting: false,
    getTableState: () => ({}) as TableState,
});
