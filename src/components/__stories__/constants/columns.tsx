import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import type {Item} from '../types';

export const columns: ColumnDef<Item>[] = [
    {accessorKey: 'name', header: 'Name', size: 100},
    {accessorKey: 'age', header: 'Age', size: 100},
    {
        id: 'name-age',
        accessorFn: (item) => `${item.name}: ${item.age}`,
        header: () => <b>Name: Age</b>,
        cell: (info) => <i>{info.getValue<string>()}</i>,
        maxSize: 200,
        minSize: 100,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
    },
];
