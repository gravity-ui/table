import React from 'react';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {columns} from '../constants/columns';
import {data} from '../constants/data';

export const ResizingStory = () => {
    const table = useTable({
        columns,
        data,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
    });

    return <BaseTable table={table} />;
};
