import * as React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {getRowVirtualizerRuntime} from '../../../hooks/useAdaptiveVirtualizer/utils/getRowVirtualizerRuntime';
import {getVirtualRowPositionStyle} from '../utils/getVirtualRowPositionStyle';
import {isCurrentMeasurementTarget} from '../utils/isCurrentMeasurementTarget';

interface UseVirtualizedRowProps<TData, TScrollElement extends Element | Window> {
    deferred: boolean;
    forwardedRef: React.Ref<HTMLTableRowElement>;
    row: Row<TData>;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    virtualItem?: VirtualItem;
}

export function useVirtualizedRow<TData, TScrollElement extends Element | Window>({
    deferred,
    forwardedRef,
    row,
    rowVirtualizer,
    virtualItem,
}: UseVirtualizedRowProps<TData, TScrollElement>) {
    const runtime = rowVirtualizer ? getRowVirtualizerRuntime(rowVirtualizer) : undefined;
    const directDomUpdates = Boolean(runtime?.directDomUpdates);
    const directDomUpdatesMode = runtime?.directDomUpdatesMode ?? 'transform';
    const placeholderNodeRef = React.useRef<HTMLTableRowElement>();
    const placeholderVirtualKeyRef = React.useRef<VirtualItem['key']>();
    const virtualIndex = virtualItem?.index;
    const virtualKey = virtualItem?.key;
    const virtualItemPosition =
        rowVirtualizer && virtualItem
            ? virtualItem.start - rowVirtualizer.options.scrollMargin
            : undefined;
    const measurementVersion = `${row.depth}:${row.parentId ?? ''}:${Number(row.getCanExpand())}`;

    const measureRow = React.useCallback(
        (node: HTMLTableRowElement | null) => {
            if (!node || !isCurrentMeasurementTarget(node, virtualIndex, measurementVersion)) {
                return;
            }

            if (directDomUpdates && rowVirtualizer && virtualItemPosition !== undefined) {
                const nodeStyle = node.style;
                if (directDomUpdatesMode === 'position') {
                    nodeStyle.top = `${virtualItemPosition}px`;
                } else {
                    nodeStyle.top = '';
                    nodeStyle.transform = `translate3d(0, ${virtualItemPosition}px, 0)`;
                }
            }

            rowVirtualizer?.measureElement(node);
        },
        [
            directDomUpdates,
            directDomUpdatesMode,
            measurementVersion,
            rowVirtualizer,
            virtualIndex,
            virtualItemPosition,
        ],
    );

    const registerPlaceholder = React.useCallback(
        (node: HTMLTableRowElement | null) => {
            const placeholderElements = runtime?.placeholderElements;
            const previousNode = placeholderNodeRef.current;
            const previousKey = placeholderVirtualKeyRef.current;

            if (
                placeholderElements &&
                previousNode &&
                previousKey !== undefined &&
                placeholderElements.get(previousKey) === previousNode
            ) {
                placeholderElements.delete(previousKey);
            }

            placeholderNodeRef.current = node ?? undefined;
            placeholderVirtualKeyRef.current = node ? virtualKey : undefined;

            if (placeholderElements && node && virtualKey !== undefined) {
                placeholderElements.set(virtualKey, node);
            }
        },
        [runtime, virtualKey],
    );

    let virtualizerRef: React.RefCallback<HTMLTableRowElement> | undefined;
    if (rowVirtualizer) {
        virtualizerRef = deferred ? registerPlaceholder : measureRow;
    }

    return {
        rowRef: useForkRef(virtualizerRef, forwardedRef),
        virtualRowPositionStyle: getVirtualRowPositionStyle(
            rowVirtualizer,
            virtualItem,
            deferred,
            directDomUpdates,
            directDomUpdatesMode,
        ),
    };
}
