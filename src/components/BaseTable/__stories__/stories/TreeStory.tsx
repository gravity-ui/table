import * as React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {data, getColumns} from '../constants/tree';

const columns = getColumns();

export const TreeStory = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useTable({
        columns,
        data,
        getSubRows: (item) => item.children,
        enableExpanding: true,
        onExpandedChange: setExpanded,
        state: {
            expanded,
        },
    });

    return <BaseTable table={table} />;
};
