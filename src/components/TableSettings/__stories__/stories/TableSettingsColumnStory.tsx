import * as React from 'react';

import type {ColumnDef, ColumnPinningState, RowSelectionState} from '@tanstack/react-table';

import {SETTINGS_COLUMN_ID, getSettingsColumn, selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import {Table} from '../../../Table/Table';
import type {TableSettingsOptions} from '../../TableSettings';

import {cnTableSettingsColumnStory} from './TableSettingsColumnStory.classname';

import './TableSettingsColumnStory.scss';

type Item = {
    id: string;
    operatorName: string;
    contactGroupName: string;
    contactName: string;
    contactPhone: string;
    contactGroupType: string;
    contactPriority: string;
};

const data: Item[] = [
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
        id: '33',
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

const tableColumns: ColumnDef<Item>[] = [
    {
        id: 'contact_group_name',
        accessorKey: 'contactGroupName',
        header: 'Name',
        minSize: 250,
    },
    {
        id: 'contact_group_type',
        accessorKey: 'contactGroupType',
        header: 'Type',
        minSize: 230,
    },
    {
        id: 'contacts_group_name',
        accessorKey: 'contactName',
        header: 'Name',
        minSize: 200,
    },
    {
        id: 'contacts_group_phone',
        accessorKey: 'contactPhone',
        header: 'Phone',
        minSize: 230,
    },
    {
        id: 'contacts_group_priority',
        accessorKey: 'contactPriority',
        header: 'Priority',
        minSize: 200,
    },
];

const tableColumnsWithGroups: ColumnDef<Item>[] = [
    {
        id: 'contact_group_group',
        header: 'Contact Group',
        columns: [
            {
                id: 'contact_group_name',
                accessorKey: 'contactGroupName',
                header: 'Name',
                minSize: 250,
            },
            {
                id: 'contact_group_type',
                accessorKey: 'contactGroupType',
                header: 'Type',
                minSize: 230,
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
                minSize: 200,
            },
            {
                id: 'contacts_group_phone',
                accessorKey: 'contactPhone',
                header: 'Phone',
                minSize: 230,
            },
            {
                id: 'contacts_group_priority',
                accessorKey: 'contactPriority',
                header: 'Priority',
                minSize: 200,
            },
        ],
    },
];

export const TableSettingsColumnStory = ({sortable, filterable}: TableSettingsOptions) => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const columns = React.useMemo(
        () => [
            selectionColumn as ColumnDef<Item>,
            ...tableColumns,
            getSettingsColumn<Item>(SETTINGS_COLUMN_ID, {sortable, filterable}),
        ],
        [sortable, filterable],
    );

    const table = useTable({
        columns,
        data,
        enableColumnPinning: true,
        state: {rowSelection},
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
    });

    return (
        <div className={cnTableSettingsColumnStory()}>
            <Table
                table={table}
                cellClassName={cnTableSettingsColumnStory('cell')}
                headerCellClassName={cnTableSettingsColumnStory('header-cell')}
            />
        </div>
    );
};

export const TableSettingsColumnWithGroupsStory = ({
    sortable,
    filterable,
}: TableSettingsOptions) => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: ['_select'],
        right: [SETTINGS_COLUMN_ID],
    });

    const columns = React.useMemo(
        () => [
            selectionColumn as ColumnDef<Item>,
            ...tableColumnsWithGroups,
            getSettingsColumn<Item>(SETTINGS_COLUMN_ID, {sortable, filterable}),
        ],
        [sortable, filterable],
    );

    const table = useTable({
        columns,
        data,
        enableColumnPinning: true,
        state: {rowSelection, columnPinning},
        onColumnPinningChange: setColumnPinning,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
    });

    return (
        <div className={cnTableSettingsColumnStory()}>
            <Table
                table={table}
                cellClassName={cnTableSettingsColumnStory('cell')}
                headerCellClassName={cnTableSettingsColumnStory('header-cell')}
            />
        </div>
    );
};
