import React from 'react';

import {useSortable} from '@dnd-kit/sortable';
import {useForkRef} from '@gravity-ui/uikit';
import type {Row as RowType} from '@tanstack/react-table';

import {useDraggableRowDepth, useDraggableRowStyle} from '../../hooks';
import type {BaseRowProps} from '../BaseRow';
import {BaseRow} from '../BaseRow';
import {SortableListContext} from '../SortableListContext';
import {TableContext} from '../TableContext';

export interface BaseDraggableRowProps<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
> extends BaseRowProps<TData, TScrollElement> {}

export const BaseDraggableRow = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            attributes: attributesProp,
            row,
            style,
            ...restProps
        }: BaseDraggableRowProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const {setNodeRef, transform, transition, isDragging} = useSortable({
            id: row.id,
        });

        const {
            isChildMode,
            activeItemKey,
            targetItemIndex = -1,
        } = React.useContext(SortableListContext) ?? {};
        const {enableNesting} = React.useContext(TableContext);

        const isDragActive = Boolean(activeItemKey);
        const isParent = isChildMode && targetItemIndex === row.index;

        const handleRowRef = useForkRef(setNodeRef, ref);

        const {isFirstChild, depth} = useDraggableRowDepth<TData>({
            row,
            isDragging,
        });

        const draggableStyle = useDraggableRowStyle({
            style,
            transform,
            transition,
            isDragging,
            isDragActive,
            isFirstChild,
            nestingEnabled: enableNesting,
        });

        const getDraggableRowDataAttributes = React.useCallback(
            (draggableRow: RowType<TData>) => {
                const attributes =
                    typeof attributesProp === 'function'
                        ? attributesProp(draggableRow)
                        : attributesProp;

                return {
                    ...attributes,
                    'data-key': draggableRow.id,
                    'data-depth': depth,
                    'data-draggable': true,
                    'data-dragging': isDragging,
                    'data-drag-active': isDragActive,
                    'data-expanded': isDragActive && isParent,
                };
            },
            [attributesProp, depth, isDragging, isDragActive, isParent],
        );

        return (
            <BaseRow
                ref={handleRowRef}
                attributes={getDraggableRowDataAttributes}
                row={row}
                style={draggableStyle}
                {...restProps}
            />
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseDraggableRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {
    displayName: string;
};

BaseDraggableRow.displayName = 'BaseDraggableRow';
