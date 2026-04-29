import * as React from 'react';

import {arraysShallowEqual} from '../../utils';
import {MemoBaseCell} from '../BaseCell/BaseCell.memo';

import type {BaseRowProps} from './BaseRow';
import {BaseRow} from './BaseRow';

export interface MemoBaseRowProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends BaseRowProps<TData, TScrollElement> {
    /** @internal Snapshot of row state — required so the comparator can detect state changes. */
    _rowVersion: readonly unknown[];
}

// eslint-disable-next-line complexity
function areEqual<TData, TScrollElement extends Element | Window>(
    prev: Readonly<BaseRowProps<TData, TScrollElement>>,
    next: Readonly<BaseRowProps<TData, TScrollElement>>,
): boolean {
    return (
        prev.row === next.row &&
        arraysShallowEqual(prev._rowVersion ?? [], next._rowVersion ?? []) &&
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
        prev['aria-selected'] === next['aria-selected']
    );
}

const BaseRowWithMemoCell = React.forwardRef(function BaseRowWithMemoCellRender<
    TData,
    TScrollElement extends Element | Window,
>(props: BaseRowProps<TData, TScrollElement>, ref: React.Ref<HTMLTableRowElement>) {
    return <BaseRow {...props} Cell={MemoBaseCell} ref={ref} />;
}) as <TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement;

export const MemoBaseRow = React.memo(BaseRowWithMemoCell, areEqual) as <
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
>(
    props: MemoBaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement;
