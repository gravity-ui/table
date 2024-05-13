import React from 'react';

import type {TableProps, VirtualizationProviderProps} from '../components';
import {VirtualizationProvider} from '../components';

export interface WithTableVirtualizationProps<TData>
    extends TableProps<TData>,
        Pick<
            VirtualizationProviderProps,
            'overscanRowCount' | 'containerClassName' | 'estimateRowSize' | 'containerHeight'
        > {}

export function withTableVirtualization(
    Component: <TData, ExtraProps = {}>(
        props: TableProps<TData> & ExtraProps,
    ) => React.ReactElement,
) {
    const TableWithVirtualization = <TData,>(props: WithTableVirtualizationProps<TData>) => {
        const {data, overscanRowCount, containerClassName, containerHeight, estimateRowSize} =
            props;

        return (
            <VirtualizationProvider
                rowsCount={data.length}
                overscanRowCount={overscanRowCount}
                containerClassName={containerClassName}
                estimateRowSize={estimateRowSize}
                containerHeight={containerHeight}
            >
                <Component<TData> {...props} />
            </VirtualizationProvider>
        );
    };

    TableWithVirtualization.displayName = `withTableVirtualization(${Component.name})`;

    return TableWithVirtualization;
}
