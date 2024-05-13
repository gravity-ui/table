import React from 'react';

import type {TableProps} from '../Table';
import {Table} from '../Table';

import type {GroupOrItem} from './constants/grouping';
import {columns, data} from './constants/grouping';

const getSubRows = (item: GroupOrItem) => ('items' in item ? item.items : undefined);
const getGroupTitle: TableProps<GroupOrItem>['getGroupTitle'] = (row) => row.getValue('name');
const getRowId = (item: GroupOrItem) => item.id;

const checkIsGroupRow: TableProps<GroupOrItem>['checkIsGroupRow'] = (row) =>
    'items' in row.original;

export function GroupingWithSelectionDemo() {
    const [expandedIds, setExpandedIds] = React.useState<string[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    return (
        <Table<GroupOrItem>
            data={data}
            columns={columns}
            getSubRows={getSubRows}
            getGroupTitle={getGroupTitle}
            getRowId={getRowId}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            selectedIds={selectedIds}
            onSelectedChange={setSelectedIds}
            checkIsGroupRow={checkIsGroupRow}
        />
    );
}
