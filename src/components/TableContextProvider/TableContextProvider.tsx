import React from 'react';

import type {Row} from '@tanstack/react-table';

import type {TableContextProps} from '../TableContext';
import {TableContext} from '../TableContext';

export interface TableContextProviderProps<TData> {
    children?: React.ReactNode;
    enableNesting?: TableContextProps['enableNesting'];
    getRowByIndex: (index: number) => Row<TData> | undefined;
}

export const TableContextProvider = <TData,>({
    children,
    enableNesting,
    getRowByIndex,
}: TableContextProviderProps<TData>) => {
    const contextValue = React.useMemo(
        () => ({getRowByIndex, enableNesting}) as TableContextProps,
        [getRowByIndex, enableNesting],
    );

    return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
};
