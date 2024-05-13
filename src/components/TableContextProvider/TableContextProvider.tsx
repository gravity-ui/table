import React from 'react';

import type {Row} from '@tanstack/react-table';

import type {TableContextProps} from '../TableContext';
import {TableContext} from '../TableContext';

export interface TableContextProviderProps<TData>
    extends Pick<TableContextProps, 'enableNesting' | 'getTableState'> {
    children?: React.ReactNode;
    getRowByIndex: (index: number) => Row<TData> | undefined;
}

export const TableContextProvider = <TData,>({
    children,
    enableNesting,
    getRowByIndex,
    getTableState,
}: TableContextProviderProps<TData>) => {
    const contextValue = React.useMemo(
        () => ({getRowByIndex, enableNesting, getTableState}) as TableContextProps,
        [getRowByIndex, enableNesting, getTableState],
    );

    return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
};
