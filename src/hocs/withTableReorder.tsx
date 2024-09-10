import React from 'react';

import {ReorderingProvider} from '../components';
import type {BaseTableProps, ReorderingProviderProps} from '../components';

export interface WithTableReorderProps<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
> extends BaseTableProps<TData, TScrollElement>,
        Pick<ReorderingProviderProps<TData>, 'onReorder' | 'dndModifiers' | 'enableNesting'> {}

export const withTableReorder = (
    Component: <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        props: BaseTableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
    ) => React.ReactElement,
) => {
    const TableWithReorder = React.forwardRef(
        <TData, TScrollElement extends Element | Window = HTMLDivElement>(
            {
                table,
                dndModifiers,
                enableNesting,
                onReorder,
                ...restProps
            }: WithTableReorderProps<TData, TScrollElement>,
            ref: React.Ref<HTMLTableElement>,
        ) => {
            return (
                <ReorderingProvider
                    table={table}
                    dndModifiers={dndModifiers}
                    enableNesting={enableNesting}
                    onReorder={onReorder}
                >
                    <Component ref={ref} table={table} {...restProps} />
                </ReorderingProvider>
            );
        },
    ) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
        props: WithTableReorderProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
    ) => React.ReactElement) & {displayName: string};

    TableWithReorder.displayName = `withTableReorder(${Component.name})`;

    return TableWithReorder;
};
