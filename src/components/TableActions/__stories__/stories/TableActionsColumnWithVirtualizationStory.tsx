import React from 'react';

import type {ColumnDef, RowSelectionState} from '@tanstack/react-table';

import {ACTIONS_COLUMN_ID, getActionsColumn, selectionColumn} from '../../../../constants';
import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {Table} from '../../../Table/Table';
import {actionsSettings, baseColumns} from '../constants';
import type {Item} from '../types';
import {generateData} from '../utils';

const data = generateData(300);

const columns: ColumnDef<Item>[] = [
    selectionColumn as ColumnDef<Item>,
    ...baseColumns,
    getActionsColumn<Item>(ACTIONS_COLUMN_ID, actionsSettings),
];

export const TableActionsColumnWithVirtualizationStory = () => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const table = useTable({
        columns,
        data,
        state: {rowSelection},
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
    });

    const rowVirtualizer = useWindowRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 50,
        overscan: 5,
    });

    return <Table table={table} rowVirtualizer={rowVirtualizer} />;
};
