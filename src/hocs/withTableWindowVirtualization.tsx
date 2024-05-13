import React from 'react';

import type {TableProps, WindowVirtualizationProviderProps} from '../components';
import {WindowVirtualizationProvider} from '../components';

export interface WithTableWindowVirtualizationProps<TData>
    extends TableProps<TData>,
        Pick<
            WindowVirtualizationProviderProps,
            'overscanRowCount' | 'containerClassName' | 'estimateRowSize'
        > {}

export function withTableWindowVirtualization(
    Component: <TData, ExtraProps = {}>(
        props: TableProps<TData> & ExtraProps,
    ) => React.ReactElement,
) {
    const TableWithWindowVirtualization = <TData,>(
        props: WithTableWindowVirtualizationProps<TData>,
    ) => {
        const {data, overscanRowCount, containerClassName, estimateRowSize} = props;

        return (
            <WindowVirtualizationProvider
                rowsCount={data.length}
                overscanRowCount={overscanRowCount}
                containerClassName={containerClassName}
                estimateRowSize={estimateRowSize}
            >
                <Component<TData> {...props} />
            </WindowVirtualizationProvider>
        );
    };

    TableWithWindowVirtualization.displayName = `withTableWindowVirtualization(${Component.name})`;

    return TableWithWindowVirtualization;
}
