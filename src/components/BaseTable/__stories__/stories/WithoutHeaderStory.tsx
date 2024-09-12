import React from 'react';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../../BaseTable';
import {columns} from '../constants/columns';
import {data} from '../constants/data';

export const WithoutHeaderStory = () => {
    const table = useTable({
        columns,
        data,
    });

    return <BaseTable table={table} withHeader={false} />;
};
