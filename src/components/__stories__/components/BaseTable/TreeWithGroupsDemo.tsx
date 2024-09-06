import React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../../BaseTable';
import type {TreeGroupItem} from '../../constants/tree';
import {groupsColumns, groupsData} from '../../constants/tree';

import {cnGroupingDemo} from './GroupingDemo.classname';

import './GroupingDemo.scss';

const getGroupTitle = (row: Row<TreeGroupItem>) => row.getValue<string>('name');
const getIsGroupHeaderRow = (row: Row<TreeGroupItem>) => 'items' in row.original;

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
