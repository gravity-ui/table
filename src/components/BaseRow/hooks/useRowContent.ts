import * as React from 'react';

import type {Row, Table} from '@tanstack/react-table';

import {useIsomorphicLayoutEffect} from '../../../hooks/useIsomorphicLayoutEffect';
import type {BaseCellProps} from '../../BaseCell';
import type {BaseRowProps} from '../BaseRow';
import {createVisibleCells} from '../utils/createVisibleCells';
import {getRowContent} from '../utils/getRowContent';

interface UseRowContentProps<TData> {
    canDeferOffscreenCellContent?: BaseRowProps<TData>['canDeferOffscreenCellContent'];
    cellAttributes?: BaseCellProps<TData>['attributes'];
    cellClassName?: BaseCellProps<TData>['className'];
    deferred: boolean;
    forceOffscreenCellContentHydration: boolean;
    getGroupTitle?: BaseRowProps<TData>['getGroupTitle'];
    getIsCustomRow?: BaseRowProps<TData>['getIsCustomRow'];
    getIsGroupHeaderRow?: BaseRowProps<TData>['getIsGroupHeaderRow'];
    groupHeaderClassName?: string;
    immediateCellContentColumnIds?: ReadonlySet<string> | null;
    renderCustomRowContent?: BaseRowProps<TData>['renderCustomRowContent'];
    renderGroupHeader?: BaseRowProps<TData>['renderGroupHeader'];
    renderGroupHeaderRowContent?: BaseRowProps<TData>['renderGroupHeaderRowContent'];
    renderVersion?: Readonly<Record<string, unknown>>;
    row: Row<TData>;
    scheduleOffscreenCellContentHydration?: BaseRowProps<TData>['scheduleOffscreenCellContentHydration'];
    table: Table<TData>;
}

export function useRowContent<TData>({
    canDeferOffscreenCellContent,
    cellAttributes,
    cellClassName,
    deferred,
    forceOffscreenCellContentHydration,
    getGroupTitle,
    getIsCustomRow,
    getIsGroupHeaderRow,
    groupHeaderClassName,
    immediateCellContentColumnIds,
    renderCustomRowContent,
    renderGroupHeader,
    renderGroupHeaderRowContent,
    renderVersion,
    row,
    scheduleOffscreenCellContentHydration,
    table,
}: UseRowContentProps<TData>) {
    const visibleCells = React.useMemo(
        () => (deferred ? [] : createVisibleCells(table, row, renderVersion)),
        [deferred, renderVersion, row, table],
    );
    const offscreenCellContentHydratedRef = React.useRef(!deferred);
    const [, rerenderOffscreenCellContent] = React.useReducer((version: number) => version + 1, 0);
    const {content, deferredCellContentCount} = getRowContent({
        canDeferOffscreenCellContent,
        cellAttributes,
        cellClassName,
        deferred,
        getGroupTitle,
        getIsCustomRow,
        getIsGroupHeaderRow,
        groupHeaderClassName,
        immediateCellContentColumnIds,
        offscreenCellContentHydrated: offscreenCellContentHydratedRef.current,
        renderCustomRowContent,
        renderGroupHeader,
        renderGroupHeaderRowContent,
        renderVersion,
        row,
        table,
        visibleCells,
    });

    useIsomorphicLayoutEffect(() => {
        if (deferred || offscreenCellContentHydratedRef.current) {
            return undefined;
        }

        if (
            forceOffscreenCellContentHydration ||
            deferredCellContentCount === 0 ||
            !scheduleOffscreenCellContentHydration
        ) {
            offscreenCellContentHydratedRef.current = true;
            return undefined;
        }

        return scheduleOffscreenCellContentHydration(() => {
            if (!offscreenCellContentHydratedRef.current) {
                offscreenCellContentHydratedRef.current = true;
                rerenderOffscreenCellContent();
            }
        });
    }, [
        deferred,
        deferredCellContentCount,
        forceOffscreenCellContentHydration,
        scheduleOffscreenCellContentHydration,
    ]);

    return content;
}
