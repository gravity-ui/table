import React from 'react';

import {useSortable} from '@dnd-kit/sortable';
import {useForkRef} from '@gravity-ui/uikit';

import {useDraggableRowDepth, useDraggableRowStyle} from '../../hooks';
import {toDataAttributes} from '../../utils';
import type {BaseRowProps} from '../BaseRow';
import {BaseRow} from '../BaseRow';
import {SortableListContext} from '../SortableListContext';
import {TableContext} from '../TableContext';

export interface DraggableRowProps<TData> extends BaseRowProps<TData> {}

export const DraggableRow = React.forwardRef(
    <TData,>(
        {getRowAttributes, row, style, ...restProps}: DraggableRowProps<TData>,
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

        const getDraggableRowDataAttributes = React.useCallback<
            NonNullable<BaseRowProps<TData>['getRowAttributes']>
        >(
            (row) => ({
                ...getRowAttributes?.(row),
                ...toDataAttributes({
                    key: row.id,
                    depth,
                    draggable: true,
                    dragging: isDragging,
                    dragActive: isDragActive,
                    expanded: isDragActive && isParent,
                }),
            }),
            [getRowAttributes, depth, isDragging, isDragActive, isParent],
        );

        return (
            <BaseRow
                ref={handleRowRef}
                getRowAttributes={getDraggableRowDataAttributes}
                row={row}
                style={draggableStyle}
                {...restProps}
            />
        );
    },
) as (<TData>(
    props: DraggableRowProps<TData> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {
    displayName: string;
};

DraggableRow.displayName = 'DraggableRow';
