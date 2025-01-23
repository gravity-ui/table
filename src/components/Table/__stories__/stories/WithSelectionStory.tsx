import * as React from 'react';

import type {ColumnDef, RowSelectionState} from '@tanstack/react-table';

import {selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import {columns as originalColumns} from '../../../BaseTable/__stories__/constants/columns';
import {data} from '../../../BaseTable/__stories__/constants/data';
import type {Item} from '../../../BaseTable/__stories__/types';
import {Table} from '../../Table';

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

    return <Table table={table} />;
};
