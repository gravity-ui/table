import {useTable} from '../../../../hooks';
import {columns} from '../../../BaseTable/__stories__/constants/columns';
import {data} from '../../../BaseTable/__stories__/constants/data';
import {Table} from '../../index';
import type {TableProps} from '../../index';

export const DefaultStory = (props: Omit<TableProps<(typeof data)[0]>, 'table'>) => {
    const table = useTable({
        columns,
        data,
    });

    return <Table table={table} {...props} />;
};
