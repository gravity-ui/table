import React from 'react';

import type {TableProps} from '../Table';
import {Table} from '../Table';

import type {TreeGroupItem} from './constants/tree';
import {groupsColumns, groupsData} from './constants/tree';

const getSubRows = (item: TreeGroupItem) => ('items' in item ? item.items : item.children);
const getGroupTitle: TableProps<TreeGroupItem>['getGroupTitle'] = (row) => row.getValue('name');
const getRowId = (item: TreeGroupItem) => item.id;
const checkIsGroupRow: TableProps<TreeGroupItem>['checkIsGroupRow'] = (row) =>
    'items' in row.original;

export function TreeWithGroupsDemo() {
    const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

    return (
        <Table<TreeGroupItem>
            data={groupsData}
            columns={groupsColumns}
            getSubRows={getSubRows}
            getGroupTitle={getGroupTitle}
            getRowId={getRowId}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            checkIsGroupRow={checkIsGroupRow}
        />
    );
}
