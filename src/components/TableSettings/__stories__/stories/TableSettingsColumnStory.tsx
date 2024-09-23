import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {settingsColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import {Table} from '../../../Table/Table';

type Item = {
    operatorName: string;
    contactGroupName: string;
    contactName: string;
    contactPhone: string;
    contactGroupType: string;
    contactPriority: string;
};

const data = [
    {
        id: '32',
        operatorName: 'Some telecom',
        contactGroupName: 'Contact Group 1',
        contactName: 'Contact 1',
        contactPhone: '+7 123 456 789',
        contactGroupType: 'Tech support',
        contactPriority: '1',
    },
    {
        id: '34',
        operatorName: 'Some telecom',
        contactGroupName: 'Contact Group 2',
        contactName: 'Contact 2',
        contactPhone: '+7 123 456 789',
        contactGroupType: 'Business support',
        contactPriority: '1',
    },
    {
        id: '34',
        operatorName: 'Another telecom',
        contactGroupName: 'Contact Group 3',
        contactName: 'Contact 3',
        contactPhone: '+7 123 456 789',
        contactGroupType: 'Admin support',
        contactPriority: '1',
    },
];

const columns: ColumnDef<Item>[] = [
    {
        id: 'contact_group_group',
        header: 'Contact Group',
        columns: [
            {
                id: 'contact_group_name',
                accessorKey: 'contactGroupName',
                header: 'Name',
                size: 150,
            },
            {
                id: 'contact_group_type',
                accessorKey: 'contactGroupType',
                header: 'Type',
                size: 130,
            },
        ],
    },
    {
        id: 'contacts_group',
        header: 'Contact',
        columns: [
            {
                id: 'contacts_group_name',
                accessorKey: 'contactName',
                header: 'Name',
                size: 100,
            },
            {
                id: 'contacts_group_phone',
                accessorKey: 'contactPhone',
                header: 'Phone',
                size: 130,
            },
            {
                id: 'contacts_group_priority',
                accessorKey: 'contactPriority',
                header: 'Priority',
                size: 100,
            },
        ],
    },
    settingsColumn as ColumnDef<Item>,
];

export const TableSettingsColumnStory = () => {
    const table = useTable({
        columns: columns,
        data,
    });

    return <Table table={table} />;
};
