import React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable, useWindowRowVirtualizer} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {columns} from '../constants/columns';
import type {Item} from '../types';
import {generateData} from '../utils';

import {cnVirtualizationStory} from './VirtualizationStory.classname';

const data = generateData(300);
const grouping: Array<keyof Item> = ['status', 'age'];

import './VirtualizationStory.scss';

const getGroupTitle = (row: Row<Item>) => row.getValue<string>('name');
const getIsGroupHeaderRow = (row: Row<Item>) => row.getIsGrouped();

export const GroupingWithVirtualizationStory = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
        enableExpanding: true,
        enableGrouping: true,
        onExpandedChange: setExpanded,
        state: {
            expanded,
            grouping,
        },
    });

    const rowVirtualizer = useWindowRowVirtualizer({
        count: table.getRowModel().rows.length,
        estimateSize: () => 20,
        overscan: 5,
    });

    return (
        <BaseTable
            table={table}
            rowVirtualizer={rowVirtualizer}
            getGroupTitle={getGroupTitle}
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            className={cnVirtualizationStory()}
            headerClassName={cnVirtualizationStory('header')}
            stickyHeader
        />
    );
};
