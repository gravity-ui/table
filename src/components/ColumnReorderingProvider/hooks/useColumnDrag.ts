import * as React from 'react';

import type {DragEndEvent, DragOverEvent, DragStartEvent} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';
import type {ColumnPinningState, Table} from '@tanstack/react-table';

import {b} from '../../BaseTable/BaseTable.classname';
import {REORDER_TYPE_COLUMN, fromColumnSortableId, getReorderType} from '../../TableDndRoot';
import type {TableDndScopeHandlers} from '../../TableDndRoot';
import type {ColumnReorderResult, OverlayClassNames} from '../types';
import {escapeClassName} from '../utils/escapeClassName';
import {getColumnGroup} from '../utils/getColumnGroup';
import {getCurrentColumnOrder} from '../utils/getCurrentColumnOrder';
import {getElementClassName} from '../utils/getElementClassName';

import {useAutoScroll} from './useAutoScroll';

interface UseColumnDragParams<TData> {
    table: Table<TData>;
    scopeRef: React.RefObject<HTMLElement>;
    autoScroll: boolean;
    onReorder?: (result: ColumnReorderResult) => void;
}

export function useColumnDrag<TData>({
    table,
    scopeRef,
    autoScroll,
    onReorder,
}: UseColumnDragParams<TData>) {
    const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null);
    const [targetColumnId, setTargetColumnId] = React.useState<string | null>(null);
    const [overlayClassNames, setOverlayClassNames] = React.useState<OverlayClassNames | null>(
        null,
    );

    const {startAutoScroll, stopAutoScroll} = useAutoScroll({table, scopeRef});

    const captureOverlayClassNames = React.useCallback(
        (columnId: string) => {
            const root = scopeRef.current;

            if (!root) {
                setOverlayClassNames(null);
                return;
            }

            const headerCellEl = root.querySelector(
                `.${escapeClassName(`${b('header-cell')}_id_${columnId}`)}`,
            );
            const cellEl = root.querySelector(`.${escapeClassName(`${b('cell')}_id_${columnId}`)}`);

            setOverlayClassNames({
                table: getElementClassName((cellEl ?? headerCellEl)?.closest('table')),
                thead: getElementClassName(headerCellEl?.closest('thead')),
                headerRow: getElementClassName(headerCellEl?.closest('tr')),
                headerCell: getElementClassName(headerCellEl),
                tbody: getElementClassName(cellEl?.closest('tbody')),
                row: getElementClassName(cellEl?.closest('tr')),
                cell: getElementClassName(cellEl),
            });
        },
        [scopeRef],
    );

    const resetState = React.useCallback(() => {
        setActiveColumnId(null);
        setTargetColumnId(null);
        setOverlayClassNames(null);
        document.body.style.removeProperty('cursor');
        stopAutoScroll();
    }, [stopAutoScroll]);

    const handlers = React.useMemo<TableDndScopeHandlers>(
        () => ({
            onDragStart: (event: DragStartEvent) => {
                if (getReorderType(event.active) !== REORDER_TYPE_COLUMN) {
                    return;
                }

                const columnId = fromColumnSortableId(event.active.id as string);

                setActiveColumnId(columnId);
                captureOverlayClassNames(columnId);
                document.body.style.setProperty('cursor', 'grabbing');

                if (autoScroll && getColumnGroup(table, columnId) === 'center') {
                    startAutoScroll(event);
                }
            },
            onDragOver: (event: DragOverEvent) => {
                if (getReorderType(event.active) !== REORDER_TYPE_COLUMN) {
                    return;
                }

                setTargetColumnId(
                    event.over ? fromColumnSortableId(event.over.id as string) : null,
                );
            },
            onDragEnd: (event: DragEndEvent) => {
                if (getReorderType(event.active) !== REORDER_TYPE_COLUMN) {
                    return;
                }

                const {active, over} = event;

                resetState();

                if (!over || active.id === over.id) {
                    return;
                }

                const draggedColumnId = fromColumnSortableId(active.id as string);
                const droppedOnColumnId = fromColumnSortableId(over.id as string);

                const group = getColumnGroup(table, draggedColumnId);

                if (group !== getColumnGroup(table, droppedOnColumnId)) {
                    return;
                }

                const columnPinning = table.getState().columnPinning;

                const applyReorder = () => {
                    if (group === 'center') {
                        const currentOrder = getCurrentColumnOrder(table);
                        const oldIndex = currentOrder.indexOf(draggedColumnId);
                        const newIndex = currentOrder.indexOf(droppedOnColumnId);

                        if (oldIndex === -1 || newIndex === -1) {
                            return;
                        }

                        const columnOrder = arrayMove(currentOrder, oldIndex, newIndex);

                        if (onReorder) {
                            onReorder({
                                columnOrder,
                                columnPinning,
                                pinned: false,
                                draggedColumnId,
                                targetColumnId: droppedOnColumnId,
                            });
                        } else {
                            table.setColumnOrder(columnOrder);
                        }

                        return;
                    }

                    const groupOrder = columnPinning[group] ?? [];
                    const oldIndex = groupOrder.indexOf(draggedColumnId);
                    const newIndex = groupOrder.indexOf(droppedOnColumnId);

                    if (oldIndex === -1 || newIndex === -1) {
                        return;
                    }

                    const nextColumnPinning: ColumnPinningState = {
                        ...columnPinning,
                        [group]: arrayMove(groupOrder, oldIndex, newIndex),
                    };

                    if (onReorder) {
                        onReorder({
                            columnOrder: table.getState().columnOrder,
                            columnPinning: nextColumnPinning,
                            pinned: group,
                            draggedColumnId,
                            targetColumnId: droppedOnColumnId,
                        });
                    } else {
                        table.setColumnPinning(nextColumnPinning);
                    }
                };

                React.startTransition(applyReorder);
            },
            onDragCancel: () => {
                resetState();
            },
        }),
        [autoScroll, captureOverlayClassNames, onReorder, resetState, startAutoScroll, table],
    );

    return {
        activeColumnId,
        targetColumnId,
        overlayClassNames,
        handlers,
        resetState,
    };
}
