import React from 'react';

import {ReorderingProvider} from '../components';
import type {ReorderingProviderProps, TableProps} from '../components';

export interface WithTableReorderProps<TData>
    extends TableProps<TData>,
        Pick<ReorderingProviderProps<TData>, 'onReorder' | 'dndModifiers' | 'enableNesting'> {}

export function withTableReorder(
    Component: <TData, ExtraProps = {}>(
        props: TableProps<TData> & ExtraProps,
    ) => React.ReactElement,
) {
    const TableWithReorder = <TData,>(props: WithTableReorderProps<TData>) => {
        const {data, getRowId, getSubRows, expandedIds, enableNesting, onReorder, dndModifiers} =
            props;

        return (
            <ReorderingProvider
                data={data}
                getRowId={getRowId}
                onReorder={onReorder}
                dndModifiers={dndModifiers}
                enableNesting={enableNesting}
                getSubRows={getSubRows}
                expandedIds={expandedIds}
            >
                <Component<TData> {...props} />
            </ReorderingProvider>
        );
    };

    TableWithReorder.displayName = `withTableReorder(${Component.name})`;

    return TableWithReorder;
}
