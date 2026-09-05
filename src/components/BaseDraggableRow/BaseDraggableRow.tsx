import * as React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

import {useDraggableRowDepth} from '../../hooks/useDraggableRowDepth';
import {useDraggableRowStyle} from '../../hooks/useDraggableRowStyle';
import {shouldSkipVirtualizedRowRender} from '../../utils/shouldSkipVirtualizedRowRender';
import type {BaseRowProps} from '../BaseRow';
import {BaseRow} from '../BaseRow/BaseRow';
import {SortableListContext} from '../SortableListContext';

import {useDragScrollCompensation} from './hooks/useDragScrollCompensation';

export interface BaseDraggableRowProps<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
> extends BaseRowProps<TData, TScrollElement> {}

const BaseDraggableRowComponent = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            attributes: attributesProp,
            row,
            style,
            table,
            ...restProps
        }: BaseDraggableRowProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const {
            isChildMode,
            activeItemKey,
            targetItemIndex = -1,
            dragWithoutHandle,
            enableNesting,
            // The `useSortable` hook is provided by `@dnd-kit/sortable` library and imported via `SortableListContext`.
            // This is a temporary solution to prevent importing the entire `@dnd-kit` library
            // when the user doesn't use the reordering feature.
            useSortable,
        } = React.useContext(SortableListContext) ?? {};

        const {
            setNodeRef,
            transform = null,
            transition,
            isDragging = false,
            listeners,
        } = useSortable?.({
            id: row.id,
        }) || {};
        const rowNodeRef = React.useRef<HTMLTableRowElement>(null);

        const isDragActive = Boolean(activeItemKey);
        const isParent = isChildMode && targetItemIndex === row.index;

        const handleRowRef = useForkRef(setNodeRef, rowNodeRef, ref);

        useDragScrollCompensation({
            enabled: isDragging,
            nodeRef: rowNodeRef,
            renderedTransformY: transform?.y,
        });

        const {isFirstChild, depth} = useDraggableRowDepth<TData>({
            row,
            table,
            isDragging,
        });

        const draggableStyle = useDraggableRowStyle({
            style,
            transform,
            transition,
            isDragging,
            isDragActive,
            isFirstChild,
            enableNesting,
        });

        const getDraggableRowAttributes = React.useCallback(
            (draggableRow: Row<TData>) => {
                const attributes =
                    typeof attributesProp === 'function'
                        ? attributesProp(draggableRow)
                        : attributesProp;

                const handlePointerDown = (event: React.PointerEvent<HTMLTableRowElement>) => {
                    attributes?.onPointerDown?.(event);

                    if (event.defaultPrevented) {
                        return;
                    }

                    listeners?.onPointerDown?.(event);
                };

                return {
                    ...attributes,
                    onPointerDown: dragWithoutHandle
                        ? handlePointerDown
                        : attributes?.onPointerDown,
                    'data-key': draggableRow.id,
                    'data-depth': depth,
                    'data-draggable': true,
                    'data-drag-without-handle': dragWithoutHandle || undefined,
                    'data-dragging': isDragging,
                    'data-drag-active': isDragActive,
                    'data-expanded': isDragActive && isParent,
                };
            },
            [
                attributesProp,
                depth,
                dragWithoutHandle,
                isDragging,
                isDragActive,
                isParent,
                listeners,
            ],
        );

        return (
            <BaseRow
                ref={handleRowRef}
                attributes={getDraggableRowAttributes}
                row={row}
                style={draggableStyle}
                table={table}
                {...restProps}
            />
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseDraggableRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {
    displayName: string;
};

BaseDraggableRowComponent.displayName = 'BaseDraggableRowComponent';

export const BaseDraggableRow = React.memo(
    BaseDraggableRowComponent,
    shouldSkipVirtualizedRowRender,
) as typeof BaseDraggableRowComponent & {displayName?: string};

BaseDraggableRow.displayName = 'BaseDraggableRow';
