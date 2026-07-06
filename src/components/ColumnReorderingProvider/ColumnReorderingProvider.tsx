import * as React from 'react';

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {SortableContext, useSortable} from '@dnd-kit/sortable';

import type {ColumnDef} from '../../types/base';
import {ColumnDragOverlay} from '../ColumnDragOverlay';
import type {ColumnReorderingContextValue} from '../ColumnReorderingContext';
import {ColumnReorderingContext} from '../ColumnReorderingContext';

import {autoScrollConfig} from './constants/autoScroll';
import {measuring} from './constants/measuring';
import {useColumnDrag} from './hooks/useColumnDrag';
import {useReorderingStyles} from './hooks/useReorderingStyles';
import {useScope} from './hooks/useScope';
import type {ColumnReorderingProviderProps} from './types';
import {restrictToHorizontalAxis} from './utils/restrictToHorizontalAxis';

import './ColumnReorderingProvider.scss';

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
    const {scopeRef, scopeClassName, wrapperClassName} = useScope<HTMLDivElement>();

    const {
        activeColumnId,
        targetColumnId,
        overlayClassNames,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        resetState,
    } = useColumnDrag({table, scopeRef, autoScroll, onReorder});

    const contextValue = React.useMemo<ColumnReorderingContextValue>(
        () => ({activeColumnId, targetColumnId, useSortable}),
        [activeColumnId, targetColumnId],
    );

    const reorderingStyles = useReorderingStyles({
        table,
        scopeClassName,
        activeColumnId,
        targetColumnId,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {distance: activationDistance},
        }),
    );

    const modifiers = React.useMemo(
        () => dndModifiers ?? [restrictToHorizontalAxis],
        [dndModifiers],
    );

    const sortableColumnIds = table
        .getVisibleLeafColumns()
        .filter((column) => (column.columnDef as ColumnDef<TData>).enableColumnReordering !== false)
        .map((column) => column.id);

    return (
        <ColumnReorderingContext.Provider value={contextValue}>
            <DndContext
                sensors={sensors}
                autoScroll={autoScroll ? autoScrollConfig : false}
                collisionDetection={closestCenter}
                measuring={measuring}
                modifiers={modifiers}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={resetState}
            >
                <div ref={scopeRef} className={wrapperClassName}>
                    <SortableContext items={sortableColumnIds}>{children}</SortableContext>
                </div>
                <DragOverlay modifiers={modifiers}>
                    <ColumnDragOverlay
                        table={table}
                        activeColumnId={activeColumnId}
                        overlayClassNames={overlayClassNames}
                        dragOverlayRowCount={dragOverlayRowCount}
                        renderDragOverlay={renderDragOverlay}
                    />
                </DragOverlay>
            </DndContext>
            {reorderingStyles ? <style>{reorderingStyles}</style> : null}
        </ColumnReorderingContext.Provider>
    );
};
