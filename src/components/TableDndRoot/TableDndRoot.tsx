import * as React from 'react';

import type {
    AutoScrollOptions,
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    DndContext,
    MeasuringStrategy,
    PointerSensor,
    getClientRect,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import {autoScrollConfig} from '../ColumnReorderingProvider/constants/autoScroll';

import type {ReorderType, TableDndScopeConfig} from './types';
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
    const [activeReorderType, setActiveReorderType] = React.useState<ReorderType>();
    const draggableMeasurementRef = React.useRef<{
        element: HTMLElement;
        rect: ReturnType<typeof getClientRect>;
    }>();
    const scopeList = React.useMemo(() => Object.values(scopes), [scopes]);

    const measureDraggable = React.useCallback((element: HTMLElement) => {
        const cachedMeasurement = draggableMeasurementRef.current;

        if (cachedMeasurement?.element === element) {
            return cachedMeasurement.rect;
        }

        const rect = getClientRect(element, {ignoreTransform: true});
        draggableMeasurementRef.current = {element, rect};

        return rect;
    }, []);
    const measuring = React.useMemo(
        () => ({
            ...defaultMeasuring,
            draggable: {measure: measureDraggable},
        }),
        [measureDraggable],
    );

    const columnScope = scopeList.find((scope) => scope.type === 'column');
    const rowScope = scopeList.find((scope) => scope.type === 'row');
    const activationDistance = columnScope?.activationDistance ?? rowScope?.activationDistance;

    const pointerSensor = useSensor(
        PointerSensor,
        activationDistance === undefined
            ? undefined
            : {activationConstraint: {distance: activationDistance}},
    );
    const sensors = useSensors(pointerSensor);

    const modifiers = React.useMemo(() => createMergedModifiers(scopeList), [scopeList]);

    const autoScroll = React.useMemo<AutoScrollOptions | boolean>(() => {
        const activeScope = scopeList.find((scope) => scope.type === activeReorderType);

        if (!activeScope?.autoScroll) {
            return false;
        }

        return autoScrollConfig;
    }, [activeReorderType, scopeList]);

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
            // Virtualization mutates the row container while scrolling. Keep the active node's
            // initial rect stable so dnd-kit does not reset its scroll compensation on each
            // virtual window update.
            draggableMeasurementRef.current = undefined;
            setActiveReorderType(getReorderType(event.active));
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
            setActiveReorderType(undefined);
        },
        [dispatchToScope],
    );

    const handleDragCancel = React.useCallback(
        (event: DragCancelEvent) => {
            dispatchToScope(event)?.handlers.onDragCancel?.(event);
            setActiveReorderType(undefined);
        },
        [dispatchToScope],
    );

    return (
        <DndContext
            sensors={sensors}
            autoScroll={autoScroll}
            collisionDetection={tableCollisionDetection}
            measuring={measuring}
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
