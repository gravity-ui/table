import * as React from 'react';

import type {Modifier} from '@dnd-kit/core';
import type {ColumnPinningState, Table} from '@tanstack/react-table';

export interface OverlayClassNames {
    table?: string;
    thead?: string;
    headerRow?: string;
    headerCell?: string;
    tbody?: string;
    row?: string;
    cell?: string;
}

export interface ColumnReorderResult {
    /**
     * The resulting full leaf column order. Changes only when reordering non-pinned (center) columns;
     * otherwise it equals the current order.
     */
    columnOrder: string[];
    /**
     * The resulting column pinning state. Changes only when reordering columns within a pinned group
     * (`left`/`right`); otherwise it equals the current pinning state.
     */
    columnPinning: ColumnPinningState;
    /**
     * The pin group the reorder happened in: `'left'`/`'right'` for pinned columns, `false` for center.
     * Use this to know whether `columnOrder` or `columnPinning` changed.
     */
    pinned: 'left' | 'right' | false;
    /** Id of the dragged column */
    draggedColumnId: string;
    /** Id of the column the dragged one was dropped on */
    targetColumnId: string;
}

export interface ColumnReorderingProviderProps<TData> {
    /** The table instance returned from the `useTable` hook */
    table: Table<TData>;
    /** Children */
    children?: React.ReactNode;
    /** Pointer movement (in px) required before a drag starts. Keeps header clicks (e.g. sorting) working. Default: `8` */
    activationDistance?: number;
    /**
     * Enables auto-scrolling of the nearest scrollable container while dragging near its edges.
     * Passed through to the dnd-kit `DndContext`. Default: `true`
     */
    autoScroll?: boolean;
    /** A list of the dnd-kit modifiers. Defaults to restricting movement to the horizontal axis */
    dndModifiers?: Modifier[];
    /** Number of leading rows rendered (below the header) in the drag preview. Defaults to all rows in the table */
    dragOverlayRowCount?: number;
    /**
     * Renders the floating preview shown under the pointer while dragging a column.
     * By default the column header together with all of its cells is rendered.
     * Return `null` to disable the overlay.
     */
    renderDragOverlay?: (props: {columnId: string}) => React.ReactNode;
    /**
     * Called when a column is dropped in a new position.
     * If omitted, the provider updates the table state automatically: `table.setColumnOrder` for center
     * columns and `table.setColumnPinning` when reordering within a pinned (`left`/`right`) group.
     */
    onReorder?: (result: ColumnReorderResult) => void;
}
