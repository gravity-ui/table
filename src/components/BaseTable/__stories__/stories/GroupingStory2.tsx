import * as React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {columns} from '../constants/columns';
import type {Item} from '../types';
import {generateData} from '../utils';

import {cnGroupingStory} from './GroupingStory.classname';

import './GroupingStory.scss';

const data = generateData(300);
const grouping: Array<keyof Item> = ['status', 'age'];

const getGroupTitle = (row: Row<Item>) => row.getValue<string>('name');
const getIsGroupHeaderRow = (row: Row<Item>) => row.getIsGrouped();

export const GroupingStory2 = () => {
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
