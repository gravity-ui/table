import * as React from 'react';

import type {ColumnDef, ColumnPinningState, RowSelectionState} from '@tanstack/react-table';

import {SETTINGS_COLUMN_ID, getSettingsColumn, selectionColumn} from '../../../../constants';
import {useTable} from '../../../../hooks';
import {Table} from '../../../Table/Table';
import type {TableSettingsOptions} from '../../TableSettings';
import type {Item} from '../constants/nestedSettings';
import {data, tableColumns} from '../constants/nestedSettings';

import {cnTableSettingsColumnWithSearchStory} from './TableSettingsColumnWithSearchStory.classname';

import './TableSettingsColumnWithSearchStory.scss';

export const NestedTableSettingsColumnWithSearchStory = ({
    sortable,
    filterable,
    enableSearch,
}: TableSettingsOptions) => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: ['_select'],
        right: [SETTINGS_COLUMN_ID],
    });

    const columns = React.useMemo(
        () => [
            selectionColumn as ColumnDef<Item>,
            ...tableColumns,
            getSettingsColumn<Item>(SETTINGS_COLUMN_ID, {sortable, filterable, enableSearch}),
        ],
        [sortable, filterable],
    );

    const table = useTable({
        columns,
        data,
        enableColumnPinning: true,
        state: {rowSelection, columnPinning},
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onColumnPinningChange: setColumnPinning,
        onRowSelectionChange: setRowSelection,
    });

    return (
        <div className={cnTableSettingsColumnWithSearchStory()}>
            <Table table={table} className={cnTableSettingsColumnWithSearchStory('table')} />
        </div>
    );
};
