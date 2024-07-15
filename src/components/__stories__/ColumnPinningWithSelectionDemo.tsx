import React from 'react';

import type {ColumnDef, ColumnPinningState, RowSelectionState} from '@tanstack/react-table';

import {defaultSelectionColumn} from '../../constants';
import {useTable} from '../../hooks';
import {Table} from '../Table';

import {cnColumnPinningDemo} from './ColumnPinningDemo.classname';
import {columns} from './constants/columnPinning';
import {data} from './constants/data';
import type {Item} from './types';

import './ColumnPinningDemo.scss';

const columnsWithSelection: ColumnDef<Item>[] = [
    {
        ...(defaultSelectionColumn as ColumnDef<Item>),
    },
    ...columns,
];

export const ColumnPinningWithSelectionDemo = () => {
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [defaultSelectionColumn.id ?? ''],
        right: [],
    });

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const table = useTable({
        data,
        columns: columnsWithSelection,
        getRowId: (item) => item.id,
        enableColumnPinning: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onColumnPinningChange: setColumnPinning,
        onRowSelectionChange: setRowSelection,
        state: {
            columnPinning,
            rowSelection,
        },
    });

    return (
        <div className={cnColumnPinningDemo()}>
            <Table className={cnColumnPinningDemo('table')} table={table} />
        </div>
    );
};
