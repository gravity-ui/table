import * as React from 'react';

import type {RowSelectionState, Table} from '@tanstack/react-table';

export const useRowSelectionWithSubRows = (
    table: Table<any>,
    rowSelection: RowSelectionState,
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>,
) => {
    React.useEffect(() => {
        const {rows} = table.getRowModel();

        const rowSelectionUpdated = rowSelection;

        rows.forEach((row) => {
            let isSelected = false;

            if (row.subRows.length > 0) {
                isSelected = row.getIsAllSubRowsSelected() === true;
            } else {
                isSelected = row.getIsSelected();
            }

            if (isSelected) {
                rowSelectionUpdated[row.id] = true;
            } else if (row.id in rowSelectionUpdated) {
                delete rowSelectionUpdated[row.id];
            }
        });

        setRowSelection(rowSelectionUpdated);
    }, [rowSelection, table, setRowSelection]);
};
