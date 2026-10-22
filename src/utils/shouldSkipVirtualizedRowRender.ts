import type {BaseRowProps} from '../components/BaseRow/BaseRow';
import {getRowVirtualizerRuntime} from '../hooks/useAdaptiveVirtualizer/utils/getRowVirtualizerRuntime';

import {areRowsEqual} from './areRowsEqual';
import {areShallowEqual} from './areShallowEqual';
import {areVirtualItemsEqual} from './areVirtualItemsEqual';

export function shouldSkipVirtualizedRowRender<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
>(
    previousProps: BaseRowProps<TData, TScrollElement>,
    nextProps: BaseRowProps<TData, TScrollElement>,
) {
    const directDomUpdates = Boolean(
        nextProps.rowVirtualizer &&
            getRowVirtualizerRuntime(nextProps.rowVirtualizer)?.directDomUpdates,
    );
    if (!directDomUpdates && !nextProps.rowVirtualizer?.isScrolling) {
        return false;
    }

    const previousRecord = previousProps as Record<keyof BaseRowProps<TData>, unknown>;
    const nextRecord = nextProps as Record<keyof BaseRowProps<TData>, unknown>;
    const nextKeys = Object.keys(nextProps) as Array<keyof BaseRowProps<TData>>;

    return (
        Object.keys(previousProps).length === nextKeys.length &&
        nextKeys.every((key) => {
            if (key === 'style') {
                return areShallowEqual(previousProps.style, nextProps.style);
            }
            if (key === 'tableRenderVersion') {
                return areShallowEqual(
                    previousProps.tableRenderVersion,
                    nextProps.tableRenderVersion,
                );
            }
            if (key === 'row') {
                return areRowsEqual(previousProps.row, nextProps.row);
            }
            if (key === 'virtualItem') {
                return areVirtualItemsEqual(
                    previousProps.virtualItem,
                    nextProps.virtualItem,
                    directDomUpdates,
                );
            }
            return previousRecord[key] === nextRecord[key];
        })
    );
}
