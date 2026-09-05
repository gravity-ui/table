import * as React from 'react';

import type {Row, Table} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {getRowVirtualizerSkeletonOpacity} from '../../../hooks/useAdaptiveVirtualizer/utils/getRowVirtualizerSkeletonOpacity';
import type {BaseRowProps} from '../../BaseRow';
import type {CanDeferOffscreenCellContent} from '../types';
import {createTableRenderVersion} from '../utils/createTableRenderVersion';
import {getVirtualBodyHeight} from '../utils/getVirtualBodyHeight';
import {isOffscreenCellContentDeferralEnabled} from '../utils/isOffscreenCellContentDeferralEnabled';

import {useAdaptiveTableVirtualization} from './useAdaptiveTableVirtualization';
import {useOffscreenCellContent} from './useOffscreenCellContent';
import {useVirtualizedTableBodyRef} from './useVirtualizedTableBodyRef';

interface UseTableVirtualizationProps<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
> {
    bodyRef?: React.Ref<HTMLTableSectionElement>;
    bodyStyle?: React.CSSProperties;
    canDeferOffscreenCellContent?: CanDeferOffscreenCellContent<TData>;
    columnDragActive: boolean;
    draggingRowIndex: number;
    getIsCustomRow?: BaseRowProps<TData>['getIsCustomRow'];
    getIsGroupHeaderRow?: BaseRowProps<TData>['getIsGroupHeaderRow'];
    rows: Row<TData>[];
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    table: Table<TData>;
}

export function useTableVirtualization<
    TData,
    TScrollElement extends Element | Window = HTMLDivElement,
>({
    bodyRef,
    bodyStyle,
    canDeferOffscreenCellContent,
    columnDragActive,
    draggingRowIndex,
    getIsCustomRow,
    getIsGroupHeaderRow,
    rows,
    rowVirtualizer,
    table,
}: UseTableVirtualizationProps<TData, TScrollElement>) {
    const {
        bodyRows,
        controller,
        directDomUpdates,
        resolveDeferredRow,
        runtime,
        virtualizationCoverage,
    } = useAdaptiveTableVirtualization({
        draggingRowIndex,
        getIsCustomRow,
        getIsGroupHeaderRow,
        rows,
        rowVirtualizer,
    });
    const {bodyElementRef, resolvedBodyRef} = useVirtualizedTableBodyRef({
        bodyRef,
        directDomUpdates,
        rowVirtualizer,
        runtime,
    });
    const leftColumns = table.getLeftVisibleLeafColumns();
    const centerColumns = table.getCenterVisibleLeafColumns();
    const rightColumns = table.getRightVisibleLeafColumns();
    const {
        canStageCellContent,
        forceCellContentHydration,
        immediateCellContentColumnIds,
        scheduleCellContentHydration,
    } = useOffscreenCellContent({
        bodyElementRef,
        columnDragActive,
        enabled: isOffscreenCellContentDeferralEnabled(
            Boolean(canDeferOffscreenCellContent),
            Boolean(controller),
            directDomUpdates,
        ),
        scrollElement: rowVirtualizer?.scrollElement,
        centerColumns,
        leftColumns,
        rightColumns,
    });
    const columnGeometry = [leftColumns, centerColumns, rightColumns]
        .map((columns) => columns.map((column) => `${column.id}:${column.getSize()}`).join('|'))
        .join(';');
    const rowRenderVersion = createTableRenderVersion(
        table.options as unknown as Readonly<Record<string, unknown>>,
        table.getState() as unknown as Readonly<Record<string, unknown>>,
        columnGeometry,
    );

    const getRowVirtualizationProps = React.useCallback(
        (row: Row<TData>, virtualItem: VirtualItem | undefined, rowIndex: number) => {
            const deferred = resolveDeferredRow(virtualItem, row, rowIndex);
            const isStandardRow = !getIsCustomRow?.(row) && !getIsGroupHeaderRow?.(row);

            return {
                deferred,
                key: controller ? row.id : (virtualItem?.key ?? row.id),
                rowProps: {
                    canDeferOffscreenCellContent: isStandardRow
                        ? canDeferOffscreenCellContent
                        : undefined,
                    deferred,
                    forceOffscreenCellContentHydration: forceCellContentHydration,
                    immediateCellContentColumnIds,
                    scheduleOffscreenCellContentHydration:
                        isStandardRow && canStageCellContent
                            ? scheduleCellContentHydration
                            : undefined,
                    rowVirtualizer,
                    tableRenderVersion: directDomUpdates
                        ? {
                              ...rowRenderVersion,
                              __rowExpanded: row.getIsExpanded(),
                              __rowCanExpand: row.getCanExpand(),
                              __rowSelected: row.getIsSelected(),
                              __rowSomeSelected: row.getIsSomeSelected(),
                              __rowAllSubRowsSelected: row.getIsAllSubRowsSelected(),
                          }
                        : rowRenderVersion,
                    virtualItem,
                } satisfies Partial<BaseRowProps<TData, TScrollElement>>,
            };
        },
        [
            canDeferOffscreenCellContent,
            canStageCellContent,
            controller,
            directDomUpdates,
            forceCellContentHydration,
            getIsCustomRow,
            getIsGroupHeaderRow,
            immediateCellContentColumnIds,
            resolveDeferredRow,
            rowRenderVersion,
            rowVirtualizer,
            scheduleCellContentHydration,
        ],
    );

    return {
        bodyRows,
        bodyStyle: {
            height: getVirtualBodyHeight(bodyRows.length > 0, rowVirtualizer),
            ...bodyStyle,
            '--g-table-virtualization-skeleton-opacity':
                getRowVirtualizerSkeletonOpacity(virtualizationCoverage),
        } as React.CSSProperties,
        getRowVirtualizationProps,
        resolvedBodyRef,
        virtualizationCoverage,
    };
}
