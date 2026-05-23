import {RangedSelectionCheckbox, SelectionCheckbox} from '../components';
import type {ColumnDef} from '../types/base';
import {getToggleAllEnabledRowsSelectedHandler} from '../utils';

export const selectionColumn: ColumnDef<unknown> = {
    id: '_select',
    header: ({table}) => {
        const indeterminate = table.getIsSomeRowsSelected();
        return (
            <SelectionCheckbox
                checked={table.getIsAllRowsSelected()}
                disabled={
                    !table.options.enableRowSelection || !table.options.enableMultiRowSelection
                }
                indeterminate={indeterminate}
                onChange={getToggleAllEnabledRowsSelectedHandler(table, indeterminate)}
            />
        );
    },
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
