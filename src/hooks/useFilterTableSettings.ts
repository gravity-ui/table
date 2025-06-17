import * as React from 'react';

import {isFilteredColumn} from '../components/TableSettings/TableSettings.utils';
import {getColumnTitle} from '../components/TableSettingsColumn/TableSettingsColumn.utils';
import type {Column, Header} from '../types/base';

interface UseFilterTableSettingsParams<TData> {
    filteredColumns: Column<TData, unknown>[];
    search: string;
    expandNestedColumns: boolean;
    headersById: Record<string, Header<TData, unknown>>;
}

export const useFilterTableSettings = <TData>({
    filteredColumns,
    search,
    expandNestedColumns,
    headersById,
}: UseFilterTableSettingsParams<TData>) => {
    const {hiddenNodes, partiallyHiddenNodes} = React.useMemo(() => {
        const hiddenNodes = new Set<string>();
        const partiallyHiddenNodes = new Set<string>();
        const columnMatches = new Set<string>();

        const checkColumnVisibility = (column: Column<TData>[], parentColumn?: Column<TData>) => {
            const visibleColumns = column.filter(function findColumn(
                column: Column<TData>,
            ): boolean {
                // column matches
                if (isFilteredColumn(getColumnTitle(column, headersById[column.id]), search)) {
                    columnMatches.add(column.id);
                    return true;
                }

                // nested column matches
                if (column.columns.findIndex((childColumn) => findColumn(childColumn)) !== -1) {
                    return true;
                }

                if (parentColumn) {
                    if (columnMatches.has(parentColumn.id)) {
                        partiallyHiddenNodes.add(parentColumn.id);
                    }
                    // show all columns in expanded view mode
                    if (expandNestedColumns && !hiddenNodes.has(parentColumn.id)) {
                        return true;
                    }
                }
                // remove column form list
                hiddenNodes.add(column.id);
                return false;
            });

            visibleColumns.forEach((column) => {
                checkColumnVisibility(column.columns, column);
            });
        };

        if (search.length > 0) {
            checkColumnVisibility(filteredColumns);
        }

        return {hiddenNodes, partiallyHiddenNodes};
    }, [filteredColumns, search, expandNestedColumns, headersById]);

    return {hiddenNodes, partiallyHiddenNodes};
};
