import * as React from 'react';

import {useTable} from '../../../../hooks';
import {data} from '../../../BaseTable/__stories__/constants/data';
import type {Item} from '../../../BaseTable/__stories__/types';
import {RowLink} from '../../../RowLink/RowLink';
import {Table} from '../../index';
import type {ColumnDef, TableProps} from '../../index';

const patchedColumns: ColumnDef<Item>[] = [
    {accessorKey: 'name', header: 'Name', size: 100},
    {accessorKey: 'age', header: 'Age', size: 100},
    {
        id: 'name-age',
        accessorFn: (item, index) => (
            <React.Fragment>
                {`${item.name}: ${item.age}`}
                <RowLink
                    entity={item}
                    index={index}
                    getLinkProps={() => ({
                        href: `https://github.com/gravity-ui/table#${item.name}`,
                        target: '_blank',
                    })}
                />
            </React.Fragment>
        ),
        header: () => <b>Name: Age</b>,
        cell: (info) => <i>{info.getValue<string>()} </i>,
        maxSize: 200,
        minSize: 100,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
    },
];

export const RowLinkStory = (props: Omit<TableProps<(typeof data)[0]>, 'table'>) => {
    const table = useTable({
        columns: patchedColumns,
        data,
    });

    return <Table table={table} {...props} />;
};
