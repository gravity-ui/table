import * as React from 'react';

import type {RowSelectionState, Table} from '@tanstack/react-table';

export const useRowSelectionWithSubRows = (table: Table<any>, rowSelection: RowSelectionState) => {
    React.useEffect(() => {
        const {rows} = table.getRowModel();

        rows.forEach((row) => {
            if (row.subRows.length > 0) {
                if (row.getIsAllSubRowsSelected() === true) {
                    row.toggleSelected(true);
                } else if (row.getIsSomeSelected() === false) {
                    row.toggleSelected(false);
                }
            }
        });
    }, [rowSelection, table]);
};
