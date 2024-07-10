import React from 'react';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {columns} from './constants/columns';
import {data} from './constants/data';

export const WithoutHeaderDemo = () => {
    const table = useTable({
        columns,
        data,
    });

    return <Table table={table} withHeader={false} />;
};
