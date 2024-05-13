import React from 'react';

import {useWindowVirtualizer} from '@tanstack/react-virtual';

import {VirtualizationContainer} from '../VirtualizationContainer';
import {VirtualizationContext} from '../VirtualizationContext';

export interface WindowVirtualizationProviderProps {
    rowsCount: number;
    overscanRowCount?: number;
    containerClassName?: string;
    estimateRowSize: (rowIndex: number) => number;
    children?: React.ReactNode;
}

export const WindowVirtualizationProvider = ({
    children,
    rowsCount,
    overscanRowCount,
    containerClassName,
    estimateRowSize,
}: WindowVirtualizationProviderProps) => {
    const rowVirtualizer = useWindowVirtualizer({
        count: rowsCount,
        estimateSize: estimateRowSize,
        measureElement: (element) => element?.getBoundingClientRect().height,
        overscan: overscanRowCount,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    const contextValue = React.useMemo(
        () => ({
            virtualItems,
            totalSize,
            measureRow: rowVirtualizer.measureElement,
        }),
        [virtualItems, totalSize, rowVirtualizer.measureElement],
    );

    return (
        <VirtualizationContext.Provider value={contextValue}>
            <VirtualizationContainer className={containerClassName}>
                {children}
            </VirtualizationContainer>
        </VirtualizationContext.Provider>
    );
};
