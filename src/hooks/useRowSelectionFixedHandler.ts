import * as React from 'react';

import type {RowSelectionState, Updater} from '@tanstack/react-table';

interface UseRowSelectionFixedHandlerParams<T> {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    tableData: T[];
    item: T;
    getSubRows: (item: T) => T[] | undefined;
    getRowId: (row: T) => string;
}

const processItemSelection = <T>({
    rowSelection,
    item,
    getSubRows,
    getRowId,
}: Omit<UseRowSelectionFixedHandlerParams<T>, 'setRowSelection' | 'tableData'>): boolean => {
    let isSelected = true;

    const itemId = getRowId(item);

    const subRows = getSubRows(item) ?? [];

    if (subRows.length > 0) {
        // We cannot use every because it exits early
        // and prevents all items from being checked
        subRows.forEach((subRow) => {
            const isSubRowSelected = processItemSelection({
                item: subRow,
                rowSelection,
                getSubRows,
                getRowId,
            });

            if (!isSubRowSelected) {
                isSelected = false;
            }
        });
    } else {
        isSelected = rowSelection[itemId] === true;
    }

    if (isSelected) {
        rowSelection[itemId] = true;
    } else if (itemId in rowSelection) {
        delete rowSelection[itemId];
    }

    return isSelected;
};

export const useRowSelectionFixedHandler = <T>({
    rowSelection,
    setRowSelection,
    tableData,
    getSubRows,
    getRowId,
}: Omit<UseRowSelectionFixedHandlerParams<T>, 'item'>) => {
    const fixedRowSelectionHandler = React.useCallback(
        (rowSelectionUpdater: Updater<RowSelectionState>) => {
            const rowSelectionUpdated =
                typeof rowSelectionUpdater === 'function'
                    ? rowSelectionUpdater(rowSelection)
                    : rowSelectionUpdater;

            tableData.forEach((item) => {
                processItemSelection({
                    item,
                    rowSelection: rowSelectionUpdated,
                    getSubRows,
                    getRowId,
                });
            });

            setRowSelection(rowSelectionUpdated);
        },
        [rowSelection, setRowSelection, tableData, getSubRows, getRowId],
    );

    return fixedRowSelectionHandler;
};
