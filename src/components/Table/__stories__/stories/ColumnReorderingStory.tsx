import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/base';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {ColumnReorderingProvider} from '../../../ColumnReorderingProvider';
import {Table} from '../../index';
import type {TableProps} from '../../index';

interface Item {
    id: string;
    name: string;
    age: number;
    status: string;
}

const columns: ColumnDef<Item>[] = [
    {accessorKey: 'name', header: 'Name', size: 200},
    {accessorKey: 'age', header: 'Age', size: 200},
    {accessorKey: 'status', header: 'Status', size: 200},
    {
        id: 'name-age',
        accessorFn: (item) => `${item.name}: ${item.age}`,
        header: 'Name and age',
        size: 200,
    },
    {
        id: 'age-status',
        accessorFn: (item) => `${item.age} / ${item.status}`,
        header: 'Age and status',
        size: 200,
    },
];

const data = generateData(30) as Item[];

export const ColumnReorderingStory = (props: Omit<TableProps<Item>, 'table'>) => {
    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
    });

    return (
        <ColumnReorderingProvider table={table}>
            <div style={{maxWidth: 600, overflow: 'auto'}}>
                <Table table={table} {...props} />
            </div>
        </ColumnReorderingProvider>
    );
};
