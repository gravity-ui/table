import * as React from 'react';

import type {
    AutoScrollOptions,
    CollisionDetection,
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
    KeyboardCoordinateGetter,
    UniqueIdentifier,
} from '@dnd-kit/core';
import {
    DndContext,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    getClientRect,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import {autoScrollConfig} from '../ColumnReorderingProvider/constants/autoScroll';

import {REORDER_TYPE_ROW} from './constants';
import type {ReorderType, TableDndScopeConfig} from './types';
import {getRowKeyboardTarget} from './utils/getRowKeyboardTarget';
import {createMergedModifiers} from './utils/mergeModifiers';
import {getReorderType} from './utils/reorderType';
import {tableCollisionDetection} from './utils/tableCollisionDetection';

// Row and column providers share sensors, but keyboard dragging is enabled only for rows.
class RowKeyboardSensor extends KeyboardSensor {
    static activators: typeof KeyboardSensor.activators = KeyboardSensor.activators.map(
        (activator) => ({
            ...activator,
            handler: (event, options, context) =>
                context.active.data.current?.reorderType === REORDER_TYPE_ROW &&
                activator.handler(event, options, context),
        }),
    );
}

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
    const keyboardTargetRef = React.useRef<UniqueIdentifier>();
    const activatorEventRef = React.useRef<Event>();
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

    const handleActivation = React.useCallback(({event}: {event: Event}) => {
        activatorEventRef.current = event;
    }, []);
    const pointerSensor = useSensor(PointerSensor, {
        onActivation: handleActivation,
        activationConstraint:
            activationDistance === undefined ? undefined : {distance: activationDistance},
    });
    const keyboardCoordinates = React.useCallback<KeyboardCoordinateGetter>((event, args) => {
        const target = getRowKeyboardTarget(event, args, keyboardTargetRef.current);

        if (target) {
            keyboardTargetRef.current = target.id;
        }

        return target?.coordinates;
    }, []);
    const keyboardSensor = useSensor(RowKeyboardSensor, {
        coordinateGetter: keyboardCoordinates,
        onActivation: handleActivation,
    });
    const sensors = useSensors(pointerSensor, rowScope ? keyboardSensor : undefined);

    const collisionDetection = React.useCallback<CollisionDetection>((args) => {
        if (keyboardTargetRef.current === undefined) {
            return tableCollisionDetection(args);
        }

        const keyboardTarget = args.droppableContainers.find(
            (container) => container.id === keyboardTargetRef.current && !container.disabled,
        );

        // A tall row can overlap several targets equally. Keep the exact keyboard destination.
        if (keyboardTarget) {
            return [{id: keyboardTarget.id, data: {droppableContainer: keyboardTarget, value: 1}}];
        }

        return tableCollisionDetection(args);
    }, []);

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
            // dnd-kit < 6.2 omits activatorEvent from DragStartEvent. Both sensors provide
            // the native event before starting, so row handlers can use it on every version.
            const dragStartEvent = {
                ...event,
                activatorEvent: activatorEventRef.current ?? event.activatorEvent,
            };

            // Virtualization mutates the row container while scrolling. Keep the active node's
            // initial rect stable so dnd-kit does not reset its scroll compensation on each
            // virtual window update.
            draggableMeasurementRef.current = undefined;
            keyboardTargetRef.current =
                dragStartEvent.activatorEvent?.type === 'keydown' ? event.active.id : undefined;
            setActiveReorderType(getReorderType(event.active));
            dispatchToScope(dragStartEvent)?.handlers.onDragStart?.(dragStartEvent);
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
            keyboardTargetRef.current = undefined;
        },
        [dispatchToScope],
    );

    const handleDragCancel = React.useCallback(
        (event: DragCancelEvent) => {
            dispatchToScope(event)?.handlers.onDragCancel?.(event);
            setActiveReorderType(undefined);
            keyboardTargetRef.current = undefined;
        },
        [dispatchToScope],
    );

    return (
        <DndContext
            sensors={sensors}
            accessibility={rowScope?.accessibility}
            autoScroll={autoScroll}
            collisionDetection={collisionDetection}
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
