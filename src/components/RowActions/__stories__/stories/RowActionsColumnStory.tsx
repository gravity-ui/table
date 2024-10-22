import React from 'react';

import type {ColumnDef, RowSelectionState} from '@tanstack/react-table';

import {ACTIONS_COLUMN_ID, getActionsColumn, selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {Item} from '../../../BaseTable/__stories__/types';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {Table} from '../../../Table/Table';
import {actionsSettings, baseColumns} from '../constants';

const data = generateData(5);

const columns: ColumnDef<Item>[] = [
    selectionColumn as ColumnDef<Item>,
    ...baseColumns,
    getActionsColumn<Item>(ACTIONS_COLUMN_ID, {
        ...actionsSettings,
    }),
];

export const RowActionsColumnStory = () => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const table = useTable({
        columns,
        data,
        state: {rowSelection},
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
    });

    return <Table table={table} />;
};
