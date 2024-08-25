import React from 'react';

import type {SortingState} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {BaseTable} from '../BaseTable';

import {columns} from './constants/columns';
import {data} from './constants/data';

export const SortingDemo = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useTable({
        columns,
        data,
        enableSorting: true,
        getRowId: (item) => item.id,
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return <BaseTable table={table} />;
};
