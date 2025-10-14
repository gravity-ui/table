import * as React from 'react';

import type {CellContext, RowData} from '@tanstack/react-table';

import {LastSelectedRowContext} from '../components/LastSelectedRowContext';

export const useToggleRangeSelectionHandler = <TData extends RowData, TValue>(
    cellContext: CellContext<TData, TValue>,
) => {
    const lastSelectedRowIndexRef = React.useContext(LastSelectedRowContext);

    return (event: React.ChangeEvent<HTMLInputElement>): void => {
        const {row, table} = cellContext;
        const rowCanBeSelected = row.getCanSelect();

        if (!rowCanBeSelected) {
            return;
        }

        const checked = Boolean(event.target?.checked);
        const {index: clickedRowIndex} = row;
        const rows = table.getRowModel().rows;
        const hasNestedRows = rows.some(
            (rootLevelRow) =>
                Array.isArray(rootLevelRow.subRows) && rootLevelRow.subRows.length > 0,
        );

        if (
            hasNestedRows ||
            !(event.nativeEvent as MouseEvent)?.shiftKey ||
            lastSelectedRowIndexRef.current === null ||
            lastSelectedRowIndexRef.current === clickedRowIndex
        ) {
            row.toggleSelected(checked);
        } else {
            const startIndex = Math.min(clickedRowIndex, lastSelectedRowIndexRef.current);
            const endIndex = Math.max(clickedRowIndex, lastSelectedRowIndexRef.current);
            const rowsToSelect = table.getRowModel().rows.slice(startIndex, endIndex + 1);
            const currentRowSelectionState = table.getState().rowSelection;

            const rangeAlreadySelected = rowsToSelect.every(({id}) => {
                return currentRowSelectionState[id] === true;
            });
            const nextRowSelectionState = {...currentRowSelectionState};

            for (const rowToSelect of rowsToSelect) {
                if (rangeAlreadySelected && rowToSelect.index !== clickedRowIndex) {
                    delete nextRowSelectionState[rowToSelect.id];
                } else {
                    nextRowSelectionState[rowToSelect.id] = true;
                }
            }

            table.setRowSelection(nextRowSelectionState);
        }

        lastSelectedRowIndexRef.current = clickedRowIndex;
    };
};
