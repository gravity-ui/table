import * as React from 'react';

import {DragOverlay} from '@dnd-kit/core';
import {SortableContext, useSortable} from '@dnd-kit/sortable';

import type {ColumnDef} from '../../types/base';
import {ColumnDragInsertionIndicator} from '../ColumnDragInsertionIndicator';
import {ColumnDragOverlay} from '../ColumnDragOverlay';
import type {ColumnReorderingContextValue} from '../ColumnReorderingContext';
import {ColumnReorderingContext} from '../ColumnReorderingContext';
import {
    REORDER_TYPE_COLUMN,
    TableDndRegistryContext,
    TableDndRegistryProvider,
    TableDndScopeRegistrar,
    toColumnSortableId,
} from '../TableDndRoot';

import {useColumnDrag} from './hooks/useColumnDrag';
import {useReorderingStyles} from './hooks/useReorderingStyles';
import {useScope} from './hooks/useScope';
import type {ColumnReorderingProviderProps} from './types';
import {restrictToHorizontalAxis} from './utils/restrictToHorizontalAxis';

import './ColumnReorderingProvider.scss';

const useColumnSortable: typeof useSortable = (args) =>
    useSortable({
        ...args,
        id: toColumnSortableId(String(args.id)),
        data: {...args.data, reorderType: REORDER_TYPE_COLUMN},
    });

export const ColumnReorderingProvider = <TData,>({
    table,
    children,
    activationDistance = 8,
    autoScroll = true,
    dndModifiers,
    dragOverlayRowCount,
    renderDragOverlay,
    onReorder,
}: ColumnReorderingProviderProps<TData>) => {
    const registry = React.useContext(TableDndRegistryContext);
    const {scopeRef, scopeClassName, wrapperClassName} = useScope<HTMLDivElement>();

    const {activeColumnId, targetColumnId, overlayClassNames, handlers} = useColumnDrag({
        table,
        scopeRef,
        autoScroll,
        onReorder,
    });

    const contextValue = React.useMemo<ColumnReorderingContextValue>(
        () => ({activeColumnId, targetColumnId, useSortable: useColumnSortable}),
        [activeColumnId, targetColumnId],
    );

    const reorderingStyles = useReorderingStyles({
        table,
        scopeClassName,
        activeColumnId,
    });

    const modifiers = React.useMemo(
        () => dndModifiers ?? [restrictToHorizontalAxis],
        [dndModifiers],
    );

    const sortableColumnIds = React.useMemo(
        () =>
            table
                .getVisibleLeafColumns()
                .filter(
                    (column) =>
                        (column.columnDef as ColumnDef<TData>).enableColumnReordering !== false,
                )
                .map((column) => toColumnSortableId(column.id)),
        [table],
    );

    const scopeConfig = React.useMemo(
        () => ({
            type: 'column' as const,
            activationDistance,
            modifiers,
            autoScroll,
            handlers,
        }),
        [activationDistance, autoScroll, handlers, modifiers],
    );

    const content = (
        <ColumnReorderingContext.Provider value={contextValue}>
            <TableDndScopeRegistrar scopeId="column" config={scopeConfig} />
            <div ref={scopeRef} className={wrapperClassName}>
                <SortableContext id="columns" items={sortableColumnIds}>
                    {children}
                </SortableContext>
            </div>
            <ColumnDragInsertionIndicator
                table={table}
                scopeRef={scopeRef}
                activeColumnId={activeColumnId}
                targetColumnId={targetColumnId}
            />
            <DragOverlay dropAnimation={null} modifiers={modifiers}>
                <ColumnDragOverlay
                    table={table}
                    activeColumnId={activeColumnId}
                    overlayClassNames={overlayClassNames}
                    dragOverlayRowCount={dragOverlayRowCount}
                    renderDragOverlay={renderDragOverlay}
                />
            </DragOverlay>
            {reorderingStyles ? <style>{reorderingStyles}</style> : null}
        </ColumnReorderingContext.Provider>
    );

    if (registry) {
        return content;
    }

    return <TableDndRegistryProvider>{content}</TableDndRegistryProvider>;
};
