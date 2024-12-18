import React from 'react';

import {useTable} from '../../../../hooks';
import {columns} from '../../../BaseTable/__stories__/constants/columns';
import {data} from '../../../BaseTable/__stories__/constants/data';
import {Table} from '../../index';
import type {TableProps} from '../../index';

export const DefaultStory = (args: Omit<TableProps<(typeof data)[number]>, 'table'>) => {
    const table = useTable({
        columns,
        data,
    });

    return <Table table={table} {...args} />;
};
