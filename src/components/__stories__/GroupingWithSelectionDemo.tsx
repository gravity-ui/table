import React from 'react';

import type {ColumnDef, ExpandedState, Row, RowSelectionState} from '@tanstack/react-table';

import {defaultSelectionColumn} from '../../constants';
import {useTable} from '../../hooks';
import {Table} from '../Table';

import type {GroupOrItem} from './constants/grouping';
import {data, columns as originalColumns} from './constants/grouping';

const columns: ColumnDef<GroupOrItem>[] = [
    defaultSelectionColumn as ColumnDef<GroupOrItem>,
    ...originalColumns,
];

const checkIsGroupRow = (row: Row<GroupOrItem>) => 'items' in row.original;
const getGroupTitle = (row: Row<GroupOrItem>) => row.getValue<string>('name');

export const GroupingWithSelectionDemo = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const table = useTable({
        columns,
        data,
        enableExpanding: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getSubRows: (item) => ('items' in item ? item.items : undefined),
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,
        state: {
            expanded,
            rowSelection,
        },
        checkIsGroupRow,
    });

    return <Table table={table} checkIsGroupRow={checkIsGroupRow} getGroupTitle={getGroupTitle} />;
};
