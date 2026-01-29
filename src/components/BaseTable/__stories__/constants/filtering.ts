import type {ColumnDef} from '../../../../types/base';
import type {Item} from '../types';

export const filterableColumns: ColumnDef<Item>[] = [
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        filterFn: 'includesString',
        size: 200,
    },
    {
        id: 'age',
        header: 'Age',
        accessorKey: 'age',
        size: 100,
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true;
            return row.getValue(columnId) === filterValue;
        },
        size: 150,
    },
];
