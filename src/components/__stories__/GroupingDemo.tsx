import React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {BaseTable} from '../BaseTable';

import {cnGroupingDemo} from './GroupingDemo.classname';
import type {GroupOrItem} from './constants/grouping';
import {columns, data} from './constants/grouping';

import './GroupingDemo.scss';

const getGroupTitle = (row: Row<GroupOrItem>) => row.getValue<string>('name');
const getIsGroupHeaderRow = (row: Row<GroupOrItem>) => 'items' in row.original;

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
    });

    return (
        <BaseTable
            className={cnGroupingDemo()}
            table={table}
            getGroupTitle={getGroupTitle}
            getIsGroupHeaderRow={getIsGroupHeaderRow}
        />
    );
};
