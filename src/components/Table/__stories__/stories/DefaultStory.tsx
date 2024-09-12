import React from 'react';

import {useTable} from '../../../../hooks';
import {columns} from '../../../BaseTable/__stories__/constants/columns';
import {data} from '../../../BaseTable/__stories__/constants/data';
import {Table} from '../../index';

export const DefaultStory = () => {
    const table = useTable({
        columns,
        data,
    });

    return <Table table={table} />;
};