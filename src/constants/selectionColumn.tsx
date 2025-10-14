import {RangedSelectionCheckbox, SelectionCheckbox} from '../components';
import type {ColumnDef} from '../types/base';

export const selectionColumn: ColumnDef<unknown> = {
    id: '_select',
    header: ({table}) => (
        <SelectionCheckbox
            checked={table.getIsAllRowsSelected()}
            disabled={!table.options.enableRowSelection}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
        />
    ),
    cell: (cellContext) => (
        <RangedSelectionCheckbox
            checked={cellContext.row.getIsSelected()}
            disabled={!cellContext.row.getCanSelect()}
            indeterminate={cellContext.row.getIsSomeSelected()}
            cellContext={cellContext}
        />
    ),
    meta: {
        hideInSettings: true,
    },
    size: 32,
    minSize: 32,
};
