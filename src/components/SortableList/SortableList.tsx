import * as React from 'react';

import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';

import type {UseSortableListParams} from '../../hooks';
import {useSortableList} from '../../hooks';
import type {SortableListContextValue} from '../SortableListContext';
import {SortableListContext} from '../SortableListContext';
import {
    REORDER_TYPE_ROW,
    TableDndRegistryContext,
    TableDndRegistryProvider,
    TableDndScopeRegistrar,
    toRowSortableId,
} from '../TableDndRoot';

const useRowSortable: typeof useSortable = (args) =>
    useSortable({
        ...args,
        id: toRowSortableId(String(args.id)),
        data: {...args.data, reorderType: REORDER_TYPE_ROW},
    });

export interface SortableListProps extends UseSortableListParams {
    children?: React.ReactNode;
    dndModifiers?: import('@dnd-kit/core').Modifier[];
}

export const SortableList = ({
    children,
    items,
    onDragStart,
    onDragEnd,
    enableNesting,
    dndModifiers,
}: SortableListProps) => {
    const registry = React.useContext(TableDndRegistryContext);

    const {
        activeItemKey,
        activeItemIndex,
        isChildMode,
        isParentMode,
        isNextChildMode,
        targetItemIndex,
        handlers,
    } = useSortableList({
        items,
        onDragStart,
        onDragEnd,
        enableNesting,
    });

    const sortableRowIds = React.useMemo(() => items.map(toRowSortableId), [items]);

    const scopeConfig = React.useMemo(
        () => ({
            type: 'row' as const,
            modifiers: dndModifiers,
            autoScroll: true,
            handlers,
        }),
        [dndModifiers, handlers],
    );

    const contextValue = React.useMemo(
        () =>
            ({
                activeItemKey,
                activeItemIndex,
                isChildMode,
                isNextChildMode,
                isParentMode,
                targetItemIndex,
                enableNesting,
                useSortable: useRowSortable,
            }) satisfies SortableListContextValue,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeItemKey, isChildMode, isNextChildMode, isParentMode, targetItemIndex, enableNesting],
    );

    const content = (
        <React.Fragment>
            <TableDndScopeRegistrar scopeId="row" config={scopeConfig} />
            <SortableListContext.Provider value={contextValue}>
                <SortableContext
                    id="rows"
                    items={sortableRowIds}
                    strategy={verticalListSortingStrategy}
                >
                    {children}
                </SortableContext>
            </SortableListContext.Provider>
        </React.Fragment>
    );

    if (registry) {
        return content;
    }

    return <TableDndRegistryProvider>{content}</TableDndRegistryProvider>;
};
