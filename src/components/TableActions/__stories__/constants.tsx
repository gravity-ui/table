import React from 'react';

import {Pencil} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {ColumnDef} from '@tanstack/react-table';

import type {TableActionsSettings} from '../types';

import type {Item} from './types';

export const actionsSettings: TableActionsSettings<unknown> = {
    getRowActions: (item, index) => [
        {
            text: 'default',
            handler: () => {
                alert(JSON.stringify(item));
            },
        },
        {
            text: 'with icon',
            icon: <Icon data={Pencil} size={14} />,
            handler: () => {},
        },
        {
            text: 'disabled',
            disabled: true,
            handler: () => {},
        },
        {
            text: 'danger theme',
            theme: 'danger',
            handler: () => {
                alert(index);
            },
        },
        {
            text: 'with href',
            theme: 'normal',
            href: 'https://gravity-ui.com',
            target: '_blank',
            rel: 'noopener noreferrer',
            handler: () => {},
        },
    ],
};

export const baseColumns: ColumnDef<Item>[] = [
    {accessorKey: 'id', header: 'Index', size: 50},
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
