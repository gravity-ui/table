import React from 'react';

import {Label} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../tanstack';
import {data} from '../../../BaseTable/__stories__/constants/data';
import type {Item} from '../../../BaseTable/__stories__/types';
import {Table} from '../../index';
import type {TableProps} from '../../index';

export const columns: ColumnDef<Item>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        size: 100,
    },
    {
        accessorKey: 'age',
        header: 'Age',
        size: 100,
    },
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
        cell: (info) => {
            const value = info.getValue<string>();
            let theme: LabelProps['theme'] = 'unknown';
            switch (value) {
                case 'free':
                    theme = 'success';
                    break;
                case 'busy':
                    theme = 'warning';
                    break;
            }
            return <Label theme={theme}>{info.getValue<string>()}</Label>;
        },
    },
];

export const AlignmentStory = (args: Omit<TableProps<Item>, 'table'>) => {
    const table = useTable({
        columns,
        data,
    });

    return <Table table={table} {...args} />;
};
