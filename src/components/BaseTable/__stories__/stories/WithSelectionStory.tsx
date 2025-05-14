import * as React from 'react';

import type {RowSelectionState} from '@tanstack/react-table';

import {selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/tanstack';
import {BaseTable} from '../../BaseTable';
import {columns as originalColumns} from '../constants/columns';
import {data} from '../constants/data';
import type {Item} from '../types';

const columns: ColumnDef<Item>[] = [selectionColumn as ColumnDef<Item>, ...originalColumns];

export const WithSelectionStory = () => {
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
