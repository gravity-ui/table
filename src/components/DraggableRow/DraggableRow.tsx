import React from 'react';

import {useSortable} from '@dnd-kit/sortable';
import {useForkRef} from '@gravity-ui/uikit';

import {useDraggableRowDepth, useDraggableRowStyle} from '../../hooks';
import type {BaseRowProps} from '../BaseRow';
import {BaseRow} from '../BaseRow';
import {SortableListContext} from '../SortableListContext';
import {TableContext} from '../TableContext';
import {toDataAttributes} from '../utils/toDataAttributes';

export interface DraggableRowProps<TData> extends BaseRowProps<TData> {}

export const DraggableRow = React.forwardRef(
    <TData,>(props: DraggableRowProps<TData>, ref: React.Ref<HTMLTableRowElement>) => {
        const {getRowDataAttributes, row, style} = props;

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
            NonNullable<BaseRowProps<TData>['getRowDataAttributes']>
        >(
            (row) => ({
                ...getRowDataAttributes?.(row),
                ...toDataAttributes({
                    key: row.id,
                    depth,
                    draggable: true,
                    dragging: isDragging,
                    dragActive: isDragActive,
                    expanded: isDragActive && isParent,
                }),
            }),
            [getRowDataAttributes, depth, isDragging, isDragActive, isParent],
        );

        return (
            <BaseRow
                {...props}
                ref={handleRowRef}
                style={draggableStyle}
                getRowDataAttributes={getDraggableRowDataAttributes}
            />
        );
    },
) as (<TData>(
    props: DraggableRowProps<TData> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {
    displayName: string;
};

DraggableRow.displayName = 'DraggableRow';
