import {SelectionCheckbox} from '../components';
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
    cell: ({row}) => (
        <SelectionCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
        />
    ),
    meta: {
        hideInSettings: true,
    },
    size: 32,
    minSize: 32,
};
