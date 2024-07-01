import React from 'react';

import {useVirtualizer} from '@tanstack/react-virtual';

import {VirtualizationContainer} from '../VirtualizationContainer';
import {VirtualizationContext} from '../VirtualizationContext';
import {getVirtualRangeExtractor} from '../utils/getVirtualRangeExtractor';

export interface VirtualizationProviderProps {
    children?: React.ReactNode;
    rowsCount: number;
    overscanRowCount?: number;
    containerClassName?: string;
    containerHeight?: string;
    estimateRowSize: (rowIndex: number) => number;
}

export const VirtualizationProvider = ({
    children,
    rowsCount,
    overscanRowCount,
    containerClassName,
    containerHeight,
    estimateRowSize,
}: VirtualizationProviderProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: rowsCount,
        estimateSize: estimateRowSize,
        getScrollElement: () => containerRef.current,
        measureElement: (element) => element?.getBoundingClientRect().height,
        overscan: overscanRowCount,
        rangeExtractor: getVirtualRangeExtractor(containerRef.current),
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
            <VirtualizationContainer
                ref={containerRef}
                className={containerClassName}
                height={containerHeight}
                withScroll
            >
                {children}
            </VirtualizationContainer>
        </VirtualizationContext.Provider>
    );
};
