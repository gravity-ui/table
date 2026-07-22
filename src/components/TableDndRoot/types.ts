import type * as React from 'react';

import type {
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
    MeasuringConfiguration,
    Modifier,
} from '@dnd-kit/core';

export type ReorderType = 'row' | 'column';

export interface TableDndScopeHandlers {
    onDragStart?: (event: DragStartEvent) => void;
    onDragMove?: (event: DragMoveEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    onDragCancel?: (event: DragCancelEvent) => void;
}

export interface TableDndScopeConfig {
    type: ReorderType;
    activationDistance?: number;
    modifiers?: Modifier[];
    autoScroll?: boolean;
    measuring?: MeasuringConfiguration;
    handlers: TableDndScopeHandlers;
    renderOverlay?: () => React.ReactNode;
    renderStyles?: () => React.ReactNode;
}

export interface TableDndRegistryContextValue {
    registerScope: (id: string, config: TableDndScopeConfig) => void;
    unregisterScope: (id: string) => void;
}
