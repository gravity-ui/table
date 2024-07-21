import React from 'react';

import {ReorderingProvider} from '../components';
import type {ReorderingProviderProps, TableProps} from '../components';

export interface WithTableReorderProps<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
> extends TableProps<TData, TScrollElement>,
        Pick<ReorderingProviderProps<TData>, 'onReorder' | 'dndModifiers' | 'enableNesting'> {}

export const withTableReorder = (
    Component: <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        props: TableProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
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
                    <Component
                        ref={ref}
                        table={table}
                        enableNesting={enableNesting}
                        {...restProps}
                    />
                </ReorderingProvider>
            );
        },
    ) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
        props: WithTableReorderProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableElement>},
    ) => React.ReactElement) & {displayName: string};

    TableWithReorder.displayName = `withTableReorder(${Component.name})`;

    return TableWithReorder;
};
