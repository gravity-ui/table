import * as React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import type {TreeGroupItem} from '../constants/tree';
import {groupsColumns, groupsData} from '../constants/tree';

import {cnGroupingStory} from './GroupingStory.classname';

import './GroupingStory.scss';

const getGroupTitle = (row: Row<TreeGroupItem>) => row.getValue<string>('name');
const getIsGroupHeaderRow = (row: Row<TreeGroupItem>) => 'items' in row.original;

export const TreeWithGroupsStory = () => {
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
            className={cnGroupingStory()}
            table={table}
            getGroupTitle={getGroupTitle}
            getIsGroupHeaderRow={getIsGroupHeaderRow}
        />
    );
};
