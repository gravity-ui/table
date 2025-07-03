import type {ColumnDef} from '@tanstack/react-table';

export type Item = {
    id: string;
    contactGroupName: string;
    contactName: string;
    contactPhone: string;
    contactGroupType: string;
    contactPriority: string;
};

export const data: Item[] = [
    {
        id: '32',
        contactGroupName: 'Contact Group 1',
        contactName: 'Contact 1',
        contactPhone: '+7 123 456 789',
        contactGroupType: 'Tech support',
        contactPriority: '1',
    },
    {
        id: '33',
        contactGroupName: 'Contact Group 2',
        contactName: 'Contact 2',
        contactPhone: '+7 123 456 789',
        contactGroupType: 'Business support',
        contactPriority: '1',
    },
    {
        id: '34',

        contactGroupName: 'Contact Group 3',
        contactName: 'Contact 3',
        contactPhone: '+7 123 456 789',
        contactGroupType: 'Admin support',
        contactPriority: '1',
    },
];

export const tableColumns: ColumnDef<Item>[] = [
    {
        id: 'contact_group_name',
        accessorKey: 'contactGroupName',
        header: 'Group',
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
    },
    {
        id: 'contacts_group_priority',
        accessorKey: 'contactPriority',
        header: () => <span>Priority</span>,
        meta: {
            titleInSettings: 'Priority',
        },
    },
];
