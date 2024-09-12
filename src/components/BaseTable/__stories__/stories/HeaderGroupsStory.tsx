import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../../BaseTable';
import {columns as nestedColumns} from '../constants/columns';
import {data} from '../constants/data';
import type {Item} from '../types';

import {cnHeaderGroupsStory} from './HeaderGroupsStory.classname';

import './HeaderGroupsStory.scss';

const columns: ColumnDef<Item>[] = [
    {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
    },
    {
        id: 'columns-parent',
        header: 'Columns header',
        columns: [
            {
                id: 'columns',
                header: 'Columns',
                columns: nestedColumns,
            },
        ],
    },
    {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'id',
        columns: [
            {
                id: 'edit',
                header: 'Edit',
                accessorKey: 'id',
            },
            {
                id: 'delete',
                header: 'Delete',
                accessorKey: 'id',
            },
        ],
    },
];

export const HeaderGroupsStory = () => {
    const table = useTable({
        columns,
        data,
    });

    return <BaseTable table={table} className={cnHeaderGroupsStory()} />;
};
