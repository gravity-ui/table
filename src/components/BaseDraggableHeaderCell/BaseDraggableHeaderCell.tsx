import * as React from 'react';

import type {Header} from '../../types/base';
import type {BaseHeaderCellProps} from '../BaseHeaderCell';
import {BaseHeaderCell} from '../BaseHeaderCell';
import {ColumnReorderingContext} from '../ColumnReorderingContext';

export interface BaseDraggableHeaderCellProps<TData, TValue>
    extends BaseHeaderCellProps<TData, TValue> {}

export const BaseDraggableHeaderCell = <TData, TValue>({
    attributes: attributesProp,
    header,
    ...restProps
}: BaseDraggableHeaderCellProps<TData, TValue>) => {
    const {activeColumnId, useSortable} = React.useContext(ColumnReorderingContext) ?? {};

    const {setNodeRef, listeners, isDragging = false} = useSortable?.({id: header.column.id}) ?? {};

    const isDragActive = Boolean(activeColumnId);

    const handlePointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLTableCellElement>) => {
            if ((event.target as HTMLElement).closest('[data-role="resize-handle"]')) {
                return;
            }

            listeners?.onPointerDown?.(event);
        },
        [listeners],
    );

    const getAttributes = React.useCallback(
        (cellHeader: Header<TData, TValue>, parentHeader?: Header<TData, unknown>) => {
            const resolvedAttributes =
                typeof attributesProp === 'function'
                    ? attributesProp(cellHeader, parentHeader)
                    : attributesProp;

            return {
                ...resolvedAttributes,
                ...listeners,
                onPointerDown: handlePointerDown,
                'data-draggable': true,
                'data-dragging': isDragging,
                'data-drag-active': isDragActive,
            };
        },
        [attributesProp, handlePointerDown, isDragActive, isDragging, listeners],
    );

    return (
        <BaseHeaderCell
            ref={setNodeRef}
            header={header}
            attributes={getAttributes}
            {...restProps}
        />
    );
};

BaseDraggableHeaderCell.displayName = 'BaseDraggableHeaderCell';
