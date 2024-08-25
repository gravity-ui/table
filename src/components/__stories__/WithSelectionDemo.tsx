import React from 'react';

import type {ColumnDef, RowSelectionState} from '@tanstack/react-table';

import {defaultSelectionColumn} from '../../constants';
import {useTable} from '../../hooks';
import {BaseTable} from '../BaseTable';

import {columns as originalColumns} from './constants/columns';
import {data} from './constants/data';
import type {Item} from './types';

const columns: ColumnDef<Item>[] = [defaultSelectionColumn as ColumnDef<Item>, ...originalColumns];

export const WithSelectionDemo = () => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const table = useTable({
        columns,
        data,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    return <BaseTable table={table} />;
};
