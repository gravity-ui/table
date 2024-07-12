import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {ColumnPinningCell, ColumnPinningHeaderCell} from '../cells/ColumnPinningCell';
import type {Item} from '../types';

export const columns: ColumnDef<Item>[] = [
    {
        accessorKey: 'name',
        header: (info) => <ColumnPinningHeaderCell value="Name" info={info} />,
        cell: (info) => <ColumnPinningCell value={info.getValue<string>()} />,
        minSize: 200,
    },
    {
        accessorKey: 'age',
        header: (info) => <ColumnPinningHeaderCell value="Age" info={info} />,
        cell: (info) => <ColumnPinningCell value={info.getValue<string>()} />,
        minSize: 200,
    },
    {
        accessorKey: 'status',
        header: (info) => <ColumnPinningHeaderCell value="Status" info={info} />,
        cell: (info) => <ColumnPinningCell value={info.getValue<string>()} />,
        minSize: 300,
    },
];
