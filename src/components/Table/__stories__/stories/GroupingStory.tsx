import * as React from 'react';

import type {ExpandedState, Row} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {TreeExpandableCell} from '../../../TreeExpandableCell';
import {Table} from '../../Table';
import {columns, data} from '../constants/grouping';
import type {GroupOrItem} from '../constants/grouping';

const getGroupTitle = (row: Row<GroupOrItem>) => row.getValue<string>('name');
const getIsGroupHeaderRow = (row: Row<GroupOrItem>) =>
    'isGroupHeader' in row.original && Boolean(row.original.isGroupHeader);

export const GroupingStory = () => {
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
        <Table
            table={table}
            getGroupTitle={getGroupTitle}
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            renderGroupHeader={({row, getGroupTitle: getGroupTitleProp}) => (
                <TreeExpandableCell row={row}>{getGroupTitleProp?.(row)}</TreeExpandableCell>
            )}
            headerCellAttributes={(header) => {
                if (header.column.id === 'name') {
                    return {style: {paddingInlineStart: 36}};
                }
                return {};
            }}
        />
    );
};
