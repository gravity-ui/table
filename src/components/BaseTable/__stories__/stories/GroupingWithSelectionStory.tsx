import * as React from 'react';

import type {ExpandedState, Row, RowSelectionState} from '@tanstack/react-table';

import {selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {ColumnDef} from '../../../../types/tanstack';
import {BaseTable} from '../../BaseTable';
import type {GroupOrItem} from '../constants/grouping';
import {data, columns as originalColumns} from '../constants/grouping';

import {cnGroupingStory} from './GroupingStory.classname';

import './GroupingStory.scss';

const columns: ColumnDef<GroupOrItem>[] = [
    selectionColumn as ColumnDef<GroupOrItem>,
    ...originalColumns,
];

const getGroupTitle = (row: Row<GroupOrItem>) => row.getValue<string>('name');
const getIsGroupHeaderRow = (row: Row<GroupOrItem>) => 'items' in row.original;

export const GroupingWithSelectionStory = () => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const table = useTable({
        columns,
        data,
        enableExpanding: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getSubRows: (item) => ('items' in item ? item.items : undefined),
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,
        state: {
            expanded,
            rowSelection,
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
