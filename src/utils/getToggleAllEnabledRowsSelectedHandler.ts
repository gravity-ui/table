import type {Table} from '@tanstack/table-core';

export function getToggleAllEnabledRowsSelectedHandler<T>(
    table: Table<T>,
    isSomeRowsAreSelected: boolean,
) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isSomeRowsAreSelected) {
            const preGroupedFlatRows = table
                .getPreGroupedRowModel()
                .flatRows.filter((row) => row.getCanSelect());
            const tableRowSelection = table.getState().rowSelection;

            const allEnableRowsAreSelected = preGroupedFlatRows.every((row) => {
                return tableRowSelection[row.id] === true;
            });

            table.toggleAllRowsSelected(!allEnableRowsAreSelected);
        } else {
            table.toggleAllRowsSelected(event.target.checked);
        }
    };
}
