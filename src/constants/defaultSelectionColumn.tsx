import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import type {ColumnDef} from '@tanstack/react-table';

export const defaultSelectionColumn: ColumnDef<unknown> = {
    id: '_select',
    header: ({table}) => (
        <Checkbox
            size="l"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
        />
    ),
    cell: ({row}) => (
        <Checkbox
            size="l"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
        />
    ),
    size: 41,
    minSize: 41,
};
