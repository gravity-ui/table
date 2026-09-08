import * as React from 'react';

import type {Row} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import type {RenderedRowRecord} from '../../../hooks/useAdaptiveVirtualizer/types';
import {clearRowVirtualizerDom} from '../../../hooks/useAdaptiveVirtualizer/utils/clearRowVirtualizerDom';
import {scheduleVirtualizerElementCleanup} from '../../../hooks/useAdaptiveVirtualizer/utils/scheduleVirtualizerElementCleanup';
import {useIsomorphicLayoutEffect} from '../../../hooks/useIsomorphicLayoutEffect';
import type {BaseRowProps} from '../../BaseRow';
import {commitAdaptiveData} from '../utils/commitAdaptiveData';
import {getAdaptiveRenderGeneration} from '../utils/getAdaptiveRenderGeneration';
import {getVirtualizationCoverage} from '../utils/getVirtualizationCoverage';
import {remeasureRenderedRows} from '../utils/remeasureRenderedRows';
import {resolveRowVirtualizerRuntime} from '../utils/resolveRowVirtualizerRuntime';

interface UseAdaptiveTableVirtualizationProps<TData, TScrollElement extends Element | Window> {
    draggingRowIndex: number;
    getIsCustomRow?: BaseRowProps<TData>['getIsCustomRow'];
    getIsGroupHeaderRow?: BaseRowProps<TData>['getIsGroupHeaderRow'];
    rows: Row<TData>[];
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
}

export function useAdaptiveTableVirtualization<TData, TScrollElement extends Element | Window>({
    draggingRowIndex,
    getIsCustomRow,
    getIsGroupHeaderRow,
    rows,
    rowVirtualizer,
}: UseAdaptiveTableVirtualizationProps<TData, TScrollElement>) {
    const runtime = resolveRowVirtualizerRuntime(rowVirtualizer);
    const controller = runtime?.controller;
    const directDomUpdates = Boolean(runtime?.directDomUpdates);
    const virtualizedScrolling = Boolean(rowVirtualizer?.isScrolling);
    const getItemKey = rowVirtualizer?.options.getItemKey;
    const lanes = rowVirtualizer?.options.lanes;
    const preparedData = React.useMemo(
        () => controller?.prepareData(rows, getItemKey, lanes),
        [controller, getItemKey, lanes, rows],
    );
    const preparedRequiredIndexes = React.useMemo(
        () =>
            controller?.prepareRequiredIndexes(
                draggingRowIndex >= 0 ? [draggingRowIndex] : [],
                rows.length,
            ),
        [controller, draggingRowIndex, rows.length],
    );
    const virtualRows = rowVirtualizer?.getVirtualItems();
    const renderPlan = controller?.getRenderPlan(virtualRows?.map(({index}) => index) ?? []);
    const renderGeneration = getAdaptiveRenderGeneration(controller, renderPlan);
    const bodyRows = React.useMemo<Row<TData>[] | VirtualItem[]>(() => {
        if (!rowVirtualizer || !virtualRows) {
            return rows;
        }

        const validVirtualRows = virtualRows.filter(
            (virtualItem) => rows[virtualItem.index] !== undefined,
        );

        if (validVirtualRows.length > 0 || virtualRows.length === 0 || rows.length === 0) {
            return validVirtualRows.length === virtualRows.length ? virtualRows : validVirtualRows;
        }

        const fallbackCount = Math.min(rows.length, virtualRows.length);
        const fallbackStart = rows.length - fallbackCount;

        return virtualRows.slice(0, fallbackCount).map((virtualItem, offset) => {
            const index = fallbackStart + offset;

            return {
                ...virtualItem,
                index,
                key: rowVirtualizer.options.getItemKey(index),
            };
        });
    }, [rowVirtualizer, rows, virtualRows]);
    const visibleVirtualRange = rowVirtualizer?.range;
    const resolveDeferredRow = React.useCallback(
        (virtualItem: VirtualItem | undefined, row: Row<TData>, rowIndex: number) =>
            Boolean(
                virtualItem &&
                    controller?.isRowDeferred(
                        renderPlan ?? null,
                        rowIndex,
                        virtualItem.key,
                        row.id,
                    ) &&
                    !getIsCustomRow?.(row) &&
                    !getIsGroupHeaderRow?.(row) &&
                    !(
                        draggingRowIndex >= 0 &&
                        visibleVirtualRange &&
                        rowIndex >= visibleVirtualRange.startIndex &&
                        rowIndex <= visibleVirtualRange.endIndex
                    ),
            ),
        [
            controller,
            draggingRowIndex,
            getIsCustomRow,
            getIsGroupHeaderRow,
            renderPlan,
            visibleVirtualRange,
        ],
    );
    const renderedRows = React.useMemo<RenderedRowRecord[] | null>(() => {
        if (!rowVirtualizer) {
            return null;
        }

        return (bodyRows as VirtualItem[]).map((virtualItem) => {
            const row = rows[virtualItem.index];

            return {
                index: virtualItem.index,
                virtualKey: virtualItem.key,
                rowKey: row?.id,
                deferred: row ? resolveDeferredRow(virtualItem, row, virtualItem.index) : false,
            };
        });
        // The controller generation invalidates deferred decisions held outside React.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bodyRows, renderGeneration, resolveDeferredRow, rowVirtualizer, rows]);

    useIsomorphicLayoutEffect(() => {
        commitAdaptiveData(controller, preparedData, preparedRequiredIndexes);
        if (!renderedRows) {
            return;
        }

        if (runtime) {
            runtime.renderedRows = renderedRows;
        }
        controller?.commit(renderPlan ?? null, renderedRows);
    }, [controller, preparedData, preparedRequiredIndexes, renderedRows, renderPlan, runtime]);

    useIsomorphicLayoutEffect(
        () => () => {
            if (runtime) {
                runtime.renderedRows = null;
            }
        },
        [runtime],
    );

    useIsomorphicLayoutEffect(() => {
        rowVirtualizer?.measureElement(null);

        const currentBodyElement = runtime?.bodyElement;
        const targetWindow = currentBodyElement?.ownerDocument.defaultView;

        if (
            !directDomUpdates ||
            virtualizedScrolling ||
            !rowVirtualizer ||
            !renderedRows ||
            !currentBodyElement ||
            !targetWindow
        ) {
            return undefined;
        }

        // TanStack does not synchronously measure rows mounted during scrolling. Reconcile cached
        // sizes from raw layout after direct-DOM scrolling stops, batching reads before writes.
        const frameId = targetWindow.requestAnimationFrame(() => {
            if (!rowVirtualizer.isScrolling) {
                remeasureRenderedRows(rowVirtualizer, currentBodyElement, renderedRows);
            }
        });

        return () => targetWindow.cancelAnimationFrame(frameId);
    }, [bodyRows, directDomUpdates, renderedRows, rowVirtualizer, runtime, virtualizedScrolling]);

    useIsomorphicLayoutEffect(
        () => () => {
            if (rowVirtualizer) {
                if (runtime) {
                    clearRowVirtualizerDom(rowVirtualizer, runtime);
                }
                scheduleVirtualizerElementCleanup(rowVirtualizer);
            }
        },
        [rowVirtualizer, runtime],
    );

    return {
        bodyRows,
        controller,
        directDomUpdates,
        resolveDeferredRow,
        runtime,
        virtualizationCoverage: getVirtualizationCoverage(rowVirtualizer, renderedRows),
    };
}
