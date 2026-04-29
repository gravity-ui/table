import * as React from 'react';

import {MemoBaseCell} from '../BaseCell/BaseCell.memo';

import {BaseDraggableRow} from './BaseDraggableRow';
import type {BaseDraggableRowProps} from './BaseDraggableRow';

export interface MemoBaseDraggableRowProps<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
> extends BaseDraggableRowProps<TData, TScrollElement> {
    /** Must be provided explicitly so the memo comparator can detect selection changes. */
    isSelected: boolean;
    /** Must be provided explicitly so the memo comparator can detect expansion changes. */
    isExpanded: boolean;
}

// eslint-disable-next-line complexity
function areEqual<TData, TScrollElement extends Element | Window>(
    prev: Readonly<BaseDraggableRowProps<TData, TScrollElement>>,
    next: Readonly<BaseDraggableRowProps<TData, TScrollElement>>,
): boolean {
    return (
        prev.row === next.row &&
        prev.isSelected === next.isSelected &&
        prev.isExpanded === next.isExpanded &&
        prev.table === next.table &&
        prev.virtualItem?.start === next.virtualItem?.start &&
        prev.virtualItem?.size === next.virtualItem?.size &&
        prev.style === next.style &&
        prev.cellClassName === next.cellClassName &&
        prev.className === next.className &&
        prev.onClick === next.onClick &&
        prev.getIsCustomRow === next.getIsCustomRow &&
        prev.getIsGroupHeaderRow === next.getIsGroupHeaderRow &&
        prev.renderCustomRowContent === next.renderCustomRowContent &&
        prev.renderGroupHeader === next.renderGroupHeader &&
        prev.renderGroupHeaderRowContent === next.renderGroupHeaderRowContent &&
        prev.getGroupTitle === next.getGroupTitle &&
        prev.groupHeaderClassName === next.groupHeaderClassName &&
        prev.attributes === next.attributes &&
        prev.cellAttributes === next.cellAttributes &&
        prev.rowVirtualizer === next.rowVirtualizer &&
        prev['aria-rowindex'] === next['aria-rowindex'] &&
        prev['aria-selected'] === next['aria-selected']
    );
}

const BaseDraggableRowWithMemoCell = React.forwardRef(function BaseDraggableRowWithMemoCellRender<
    TData,
    TScrollElement extends Element | Window,
>(props: BaseDraggableRowProps<TData, TScrollElement>, ref: React.Ref<HTMLTableRowElement>) {
    return <BaseDraggableRow {...props} Cell={MemoBaseCell} ref={ref} />;
}) as <TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseDraggableRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement;

export const MemoBaseDraggableRow = React.memo(BaseDraggableRowWithMemoCell, areEqual) as <
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
>(
    props: MemoBaseDraggableRowProps<TData, TScrollElement> & {
        ref?: React.Ref<HTMLTableRowElement>;
    },
) => React.ReactElement;
