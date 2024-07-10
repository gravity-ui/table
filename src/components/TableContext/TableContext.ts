import React from 'react';

import type {Row} from '@tanstack/react-table';

export interface TableContextProps {
    getRowByIndex: <TData>(index: number) => Row<TData> | undefined;
    enableNesting?: boolean;
}

export const TableContext = React.createContext<TableContextProps>({
    getRowByIndex: () => undefined,
    enableNesting: false,
});
