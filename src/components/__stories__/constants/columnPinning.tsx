import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {ColumnPinningHeaderCell} from '../cells/ColumnPinningHeaderCell';
import type {Item} from '../types';

export const columns: ColumnDef<Item>[] = [
    {
        accessorKey: 'name',
        header: (info) => <ColumnPinningHeaderCell value="Name" info={info} />,
        minSize: 200,
    },
    {
        accessorKey: 'age',
        header: (info) => <ColumnPinningHeaderCell value="Age" info={info} />,
        minSize: 200,
    },
    {
        accessorKey: 'status',
        header: (info) => <ColumnPinningHeaderCell value="Status" info={info} />,
        minSize: 300,
    },
];
