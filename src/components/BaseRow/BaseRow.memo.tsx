import * as React from 'react';

import type {BaseRowProps} from './BaseRow';
import {BaseRow} from './BaseRow';

export interface MemoBaseRowProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends BaseRowProps<TData, TScrollElement> {
    /** Must be provided explicitly so the memo comparator can detect selection changes. */
    isSelected: boolean;
    /** Must be provided explicitly so the memo comparator can detect expansion changes. */
    isExpanded: boolean;
}

function areEqual<TData, TScrollElement extends Element | Window>(
    prev: Readonly<BaseRowProps<TData, TScrollElement>>,
    next: Readonly<BaseRowProps<TData, TScrollElement>>,
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

export const MemoBaseRow = React.memo(BaseRow, areEqual) as (<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
>(
    props: MemoBaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName?: string};

MemoBaseRow.displayName = 'MemoBaseRow';
