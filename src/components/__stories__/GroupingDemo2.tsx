import React from 'react';

import type {TableProps} from '../Table';
import {Table} from '../Table';

import {columns} from './constants/columns';
import type {Item} from './types';
import {generateData} from './utils';

const getGroupTitle: TableProps<Item>['getGroupTitle'] = (row) => row.getValue('name');
const getRowId = (item: Item) => item.id;
const checkIsGroupRow: TableProps<Item>['checkIsGroupRow'] = (row) => row.getIsGrouped();

const data = generateData(300);
const grouping: (keyof Item)[] = ['status', 'age'];

export function GroupingDemo2() {
    const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

    return (
        <Table<Item>
            data={data}
            columns={columns}
            getGroupTitle={getGroupTitle}
            getRowId={getRowId}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            checkIsGroupRow={checkIsGroupRow}
            enableGrouping
            grouping={grouping}
        />
    );
}
