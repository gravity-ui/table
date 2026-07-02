import * as React from 'react';

import type {Header} from '../../types/base';
import type {BaseHeaderCellProps} from '../BaseHeaderCell';
import {BaseHeaderCell} from '../BaseHeaderCell';
import {b} from '../BaseTable/BaseTable.classname';
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

    const getAttributes = React.useCallback(
        (cellHeader: Header<TData, TValue>, parentHeader?: Header<TData, unknown>) => {
            const resolvedAttributes =
                typeof attributesProp === 'function'
                    ? attributesProp(cellHeader, parentHeader)
                    : attributesProp;

            const handlePointerDown = (event: React.PointerEvent<HTMLTableCellElement>) => {
                resolvedAttributes?.onPointerDown?.(event);

                if ((event.target as HTMLElement).closest(`.${b('resize-handle')}`)) {
                    return;
                }

                listeners?.onPointerDown?.(event);
            };

            return {
                ...resolvedAttributes,
                ...listeners,
                onPointerDown: handlePointerDown,
                'data-draggable': true,
                'data-dragging': isDragging,
                'data-drag-active': isDragActive,
            };
        },
        [attributesProp, isDragActive, isDragging, listeners],
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
