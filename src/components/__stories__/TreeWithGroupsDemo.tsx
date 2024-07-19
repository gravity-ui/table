import React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../hooks';
import {Table} from '../Table';

import {cnGroupingDemo} from './GroupingDemo.classname';
import type {TreeGroupItem} from './constants/tree';
import {groupsColumns, groupsData} from './constants/tree';

import './GroupingDemo.scss';

const checkIsGroupRow = (row: Row<TreeGroupItem>) => 'items' in row.original;
const getGroupTitle = (row: Row<TreeGroupItem>) => row.getValue<string>('name');

export const TreeWithGroupsDemo = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useTable({
        columns: groupsColumns,
        data: groupsData,
        enableExpanding: true,
        getSubRows: (item) => ('items' in item ? item.items : item.children),
        onExpandedChange: setExpanded,
        state: {
            expanded,
        },
        checkIsGroupRow,
    });

    return (
        <Table
            className={cnGroupingDemo()}
            table={table}
            checkIsGroupRow={checkIsGroupRow}
            getGroupTitle={getGroupTitle}
        />
    );
};
