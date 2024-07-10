import React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import type {GroupOrItem} from './constants/grouping';
import {columns, data} from './constants/grouping';

const checkIsGroupRow = (row: Row<GroupOrItem>) => 'items' in row.original;
const getGroupTitle = (row: Row<GroupOrItem>) => row.getValue<string>('name');

export const GroupingDemo = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useTable({
        columns,
        data,
        enableExpanding: true,
        getSubRows: (item) => ('items' in item ? item.items : undefined),
        onExpandedChange: setExpanded,
        state: {
            expanded,
        },
        checkIsGroupRow,
    });

    return <Table table={table} checkIsGroupRow={checkIsGroupRow} getGroupTitle={getGroupTitle} />;
};
