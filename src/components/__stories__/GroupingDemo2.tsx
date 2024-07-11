import React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {columns} from './constants/columns';
import type {Item} from './types';
import {generateData} from './utils';

const data = generateData(300);
const grouping: Array<keyof Item> = ['status', 'age'];

const checkIsGroupRow = (row: Row<Item>) => row.getIsGrouped();
const getGroupTitle = (row: Row<Item>) => row.getValue<string>('name');

export const GroupingDemo2 = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useTable({
        columns,
        data,
        enableExpanding: true,
        enableGrouping: true,
        onExpandedChange: setExpanded,
        state: {
            expanded,
            grouping,
        },
        checkIsGroupRow,
    });

    return <Table table={table} checkIsGroupRow={checkIsGroupRow} getGroupTitle={getGroupTitle} />;
};
