import React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {columns, data} from './constants/tree';

export const TreeDemo = () => {
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

    return <Table table={table} />;
};
