import React from 'react';

import {Select} from '@gravity-ui/uikit';
import type {ColumnDef, RowSelectionState} from '@tanstack/react-table';

import {ACTIONS_COLUMN_ID, getActionsColumn, selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import type {Item} from '../../../BaseTable/__stories__/types';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {Table} from '../../../Table/Table';
import {actionsSettings, baseColumns} from '../constants';

const data = generateData(5);

const columns: ColumnDef<Item>[] = [
    selectionColumn as ColumnDef<Item>,
    ...baseColumns,
    getActionsColumn<Item>(ACTIONS_COLUMN_ID, {
        ...actionsSettings,
        renderRowActions: ({row}) => {
            const {index} = row;
            if (index % 2) {
                return null;
            }

            return (
                <Select
                    options={[
                        {value: '1', text: 'action 1', content: 'action 1'},
                        {value: '2', text: 'action 2', content: 'action 2'},
                        {value: '3', text: 'action 3', content: 'action 3'},
                    ]}
                    size="s"
                    title="Actions select example"
                />
            );
        },
    }),
];

export const RowActionsWithCustomRendering = () => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const table = useTable({
        columns,
        data,
        state: {rowSelection},
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
    });

    return <Table table={table} />;
};
