import * as React from 'react';

import type {
    AutoScrollOptions,
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {DndContext, MeasuringStrategy, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';

import {autoScrollConfig} from '../ColumnReorderingProvider/constants/autoScroll';

import type {TableDndScopeConfig} from './types';
import {createMergedModifiers} from './utils/mergeModifiers';
import {getReorderType} from './utils/reorderType';
import {tableCollisionDetection} from './utils/tableCollisionDetection';

const defaultMeasuring = {
    droppable: {
        strategy: MeasuringStrategy.WhileDragging,
    },
};

export interface TableDndRootProps {
    scopes: Record<string, TableDndScopeConfig>;
    children?: React.ReactNode;
}

export const TableDndRoot = ({scopes, children}: TableDndRootProps) => {
    const scopeList = React.useMemo(() => Object.values(scopes), [scopes]);

    const columnScope = scopeList.find((scope) => scope.type === 'column');
    const activationDistance = columnScope?.activationDistance;

    const pointerSensor = useSensor(
        PointerSensor,
        activationDistance === undefined
            ? undefined
            : {activationConstraint: {distance: activationDistance}},
    );
    const sensors = useSensors(pointerSensor);

    const modifiers = React.useMemo(() => createMergedModifiers(scopeList), [scopeList]);

    const autoScroll = React.useMemo<AutoScrollOptions | boolean>(() => {
        if (!scopeList.some((scope) => scope.autoScroll)) {
            return false;
        }

        return autoScrollConfig;
    }, [scopeList]);

    const dispatchToScope = React.useCallback(
        (
            event: DragStartEvent | DragMoveEvent | DragOverEvent | DragEndEvent | DragCancelEvent,
        ) => {
            const type = getReorderType(event.active);
            return scopeList.find((item) => item.type === type);
        },
        [scopeList],
    );

    const handleDragStart = React.useCallback(
        (event: DragStartEvent) => {
            dispatchToScope(event)?.handlers.onDragStart?.(event);
        },
        [dispatchToScope],
    );

    const handleDragMove = React.useCallback(
        (event: DragMoveEvent) => {
            dispatchToScope(event)?.handlers.onDragMove?.(event);
        },
        [dispatchToScope],
    );

    const handleDragOver = React.useCallback(
        (event: DragOverEvent) => {
            dispatchToScope(event)?.handlers.onDragOver?.(event);
        },
        [dispatchToScope],
    );

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            dispatchToScope(event)?.handlers.onDragEnd?.(event);
        },
        [dispatchToScope],
    );

    const handleDragCancel = React.useCallback(
        (event: DragCancelEvent) => {
            dispatchToScope(event)?.handlers.onDragCancel?.(event);
        },
        [dispatchToScope],
    );

    return (
        <DndContext
            sensors={sensors}
            autoScroll={autoScroll}
            collisionDetection={tableCollisionDetection}
            measuring={defaultMeasuring}
            modifiers={modifiers}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {children}
        </DndContext>
    );
};
