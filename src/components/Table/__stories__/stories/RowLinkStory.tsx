import {Button} from '@gravity-ui/uikit';

import {useTable} from '../../../../hooks';
import {data} from '../../../BaseTable/__stories__/constants/data';
import type {Item} from '../../../BaseTable/__stories__/types';
import {ExperimentalRowLink} from '../../../RowLink';
import {b} from '../../../RowLink/RowLink.classname';
import type {ColumnDef, TableProps} from '../../index';
import {Table} from '../../index';

const columns: ColumnDef<Item>[] = [
    {accessorKey: 'name', header: 'Name', size: 100},
    {accessorKey: 'age', header: 'Age', size: 100},
    {
        id: 'name-age',
        accessorFn: (item) => (
            <ExperimentalRowLink
                href={`#${item.name}`}
            >{`${item.name}: ${item.age}`}</ExperimentalRowLink>
        ),
        header: () => <b>Name: Age</b>,
        cell: (info) => <i>{info.getValue<string>()} </i>,
        maxSize: 200,
        minSize: 100,
    },
    {
        accessorKey: 'interactiveCell',
        header: 'Interactive Cell',
        accessorFn: (item) => (
            <Button
                className={b('interactive-element')}
                onClick={() => alert(`Clicked on ${item.name}`)}
            >
                {item.name}
            </Button>
        ),
        cell: (info) => info.getValue(),
        size: 100,
    },
];

export const RowLinkStory = (props: Omit<TableProps<(typeof data)[0]>, 'table'>) => {
    const table = useTable({
        columns: columns,
        data,
    });

    return <Table table={table} {...props} />;
};
