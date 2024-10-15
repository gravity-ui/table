import React from 'react';

import {Select} from '@gravity-ui/uikit';
import type {ColumnDef, RowSelectionState} from '@tanstack/react-table';

import {ACTIONS_COLUMN_ID, getActionsColumn, selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import {Table} from '../../../Table/Table';
import {actionsSettings, baseColumns} from '../constants';
import type {Item} from '../types';
import {generateData} from '../utils';

const data = generateData(5);

const defaultColumns: ColumnDef<Item>[] = [
    selectionColumn as ColumnDef<Item>,
    ...baseColumns,
    getActionsColumn<Item>(ACTIONS_COLUMN_ID, {
        ...actionsSettings,
    }),
];

const columnsWithRenderRowActions: ColumnDef<Item>[] = [
    selectionColumn as ColumnDef<Item>,
    ...baseColumns,
    getActionsColumn<Item>(ACTIONS_COLUMN_ID, {
        ...actionsSettings,
        renderRowActions: ({index}) => {
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

export const TableActionsColumnStory = () => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const table = useTable({
        columns: defaultColumns,
        data,
        state: {rowSelection},
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
    });

    const tableWithRenderRowActions = useTable({
        columns: columnsWithRenderRowActions,
        data,
        state: {rowSelection},
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
    });

    return (
        <React.Fragment>
            <h3>{'with getRowActions property'}</h3>
            <Table table={table} />
            <br />
            <h3>{'with renderRowActions property'}</h3>
            <Table table={tableWithRenderRowActions} />
        </React.Fragment>
    );
};
