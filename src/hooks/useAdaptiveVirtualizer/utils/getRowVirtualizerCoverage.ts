import type {Virtualizer} from '@tanstack/react-virtual';

import type {RenderedRowRecord, VirtualizationCoverage} from '../types';

export const getRowVirtualizerCoverage = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    records: RenderedRowRecord[] | null,
): VirtualizationCoverage | undefined => {
    const {range} = virtualizer;

    if (
        !range ||
        !records ||
        range.startIndex < 0 ||
        range.endIndex < range.startIndex ||
        range.endIndex >= virtualizer.options.count
    ) {
        return undefined;
    }

    const visibleRecords = new Map<number, RenderedRowRecord>();

    for (const record of records) {
        if (record.index < range.startIndex || record.index > range.endIndex) {
            continue;
        }

        if (
            visibleRecords.has(record.index) ||
            record.rowKey === undefined ||
            !Object.is(record.virtualKey, virtualizer.options.getItemKey(record.index))
        ) {
            return undefined;
        }

        visibleRecords.set(record.index, record);
    }

    let deferredRows = 0;
    let realRows = 0;

    for (let index = range.startIndex; index <= range.endIndex; index += 1) {
        const record = visibleRecords.get(index);
        if (!record) {
            return undefined;
        }

        if (record.deferred) {
            deferredRows += 1;
        } else {
            realRows += 1;
        }
    }

    if (deferredRows > 0) {
        return realRows > 0 ? 'partial' : 'none';
    }

    return realRows > 0 ? 'complete' : undefined;
};
