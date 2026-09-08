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

import {ROW_DRAG_ACTIVATION_DISTANCE} from './constants';

const useRowSortable: typeof useSortable = (args) =>
    useSortable({
        ...args,
        id: toRowSortableId(String(args.id)),
        data: {...args.data, reorderType: REORDER_TYPE_ROW},
    });

export interface SortableListProps extends UseSortableListParams {
    autoScroll?: boolean;
    children?: React.ReactNode;
    dragWithoutHandle?: boolean;
    dndModifiers?: import('@dnd-kit/core').Modifier[];
}

export const SortableList = ({
    autoScroll = true,
    children,
    items,
    onDragStart,
    onDragEnd,
    enableNesting,
    dragWithoutHandle = false,
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
            activationDistance: dragWithoutHandle ? ROW_DRAG_ACTIVATION_DISTANCE : undefined,
            modifiers: dndModifiers,
            autoScroll,
            handlers,
        }),
        [autoScroll, dndModifiers, dragWithoutHandle, handlers],
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
                dragWithoutHandle,
                useSortable: useRowSortable,
            }) satisfies SortableListContextValue,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            activeItemKey,
            dragWithoutHandle,
            enableNesting,
            isChildMode,
            isNextChildMode,
            isParentMode,
            targetItemIndex,
        ],
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
