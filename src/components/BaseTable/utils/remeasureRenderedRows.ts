import {Virtualizer} from '@tanstack/react-virtual';

import type {RenderedRowRecord} from '../../../hooks/useAdaptiveVirtualizer/types';

export function remeasureRenderedRows<TScrollElement extends Element | Window>(
    rowVirtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    bodyElement: HTMLTableSectionElement,
    renderedRows: RenderedRowRecord[],
) {
    const measurements: Array<{index: number; size: number}> = [];

    for (const record of renderedRows) {
        if (record.deferred || record.index < 0 || record.index >= rowVirtualizer.options.count) {
            continue;
        }

        const key = rowVirtualizer.options.getItemKey(record.index);
        const element = rowVirtualizer.elementsCache.get(key);

        if (
            !Object.is(record.virtualKey, key) ||
            !element?.isConnected ||
            !bodyElement.contains(element) ||
            element.dataset.virtualizationRowState !== 'real' ||
            rowVirtualizer.indexFromElement(element) !== record.index
        ) {
            continue;
        }

        const size = rowVirtualizer.options.horizontal ? element.offsetWidth : element.offsetHeight;

        if (size > 0 && rowVirtualizer.itemSizeCache.get(key) !== size) {
            measurements.push({index: record.index, size});
        }
    }

    for (const measurement of measurements) {
        rowVirtualizer.resizeItem(measurement.index, measurement.size);
    }
}
