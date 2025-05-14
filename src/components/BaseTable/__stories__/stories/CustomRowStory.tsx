import type {Row} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/tanstack';
import type {BaseTableProps} from '../../BaseTable';
import {BaseTable} from '../../BaseTable';
import {data} from '../constants/data';
import type {Item} from '../types';

interface CustomItem {
    isCustom: boolean;
}

type ItemOrCustom = Item | CustomItem;

const dataWithCustomRow: Array<ItemOrCustom> = [...data, {isCustom: true}];

const getIsCustomRow = (row: Row<ItemOrCustom>) => {
    return 'isCustom' in row.original && row.original.isCustom;
};

const renderCustomRowContent: BaseTableProps<ItemOrCustom>['renderCustomRowContent'] = ({Cell}) => {
    return <Cell colSpan={2}>This is a custom row</Cell>;
};

const columns: ColumnDef<ItemOrCustom>[] = [
    {accessorKey: 'name', header: 'Name', size: 150},
    {accessorKey: 'age', header: 'Age', size: 150},
];

export const CustomRowStory = () => {
    const table = useTable({
        columns,
        data: dataWithCustomRow,
    });

    return (
        <BaseTable
            table={table}
            getIsCustomRow={getIsCustomRow}
            renderCustomRowContent={renderCustomRowContent}
        />
    );
};
