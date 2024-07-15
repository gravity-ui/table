import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {cnColumnPinningDemo} from '../ColumnPinningDemo.classname';
import {ColumnPinningHeaderCell} from '../cells/ColumnPinningHeaderCell';
import type {Item} from '../types';

export const columns: ColumnDef<Item>[] = [
    {
        accessorKey: 'name',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Name"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        minSize: 200,
    },
    {
        accessorKey: 'age',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Age"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        minSize: 200,
    },
    {
        accessorKey: 'status',
        header: (info) => (
            <ColumnPinningHeaderCell
                value="Status"
                info={info}
                className={cnColumnPinningDemo('header-cell')}
            />
        ),
        minSize: 300,
    },
];
