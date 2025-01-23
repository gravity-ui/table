import {Text} from '@gravity-ui/uikit';
import type {ColumnDef, VisibilityState} from '@tanstack/react-table';

import {useTable, useTableSettings} from '../../../../hooks';
import {TableSettings} from '../../TableSettings';
import type {TableSettingsOptions} from '../../TableSettings';

const displayOrderingModel = (order: string[]) => {
    return `Ordering model: [${order.join(', ')}]`;
};

const displayVisibilityModel = (visibility: VisibilityState) => {
    const values = Object.entries(visibility).map(([key, value]) => `${key}: ${value}`);
    return `Visible model: {${values.join(', ')}}`;
};

const flatColumns: ColumnDef<unknown>[] = [
    {
        id: 'first',
        header: 'First',
    },
    {
        id: 'second',
        header: 'Second',
    },
    {
        id: 'third',
        header: 'Third',
    },
    {
        id: 'fourth',
        header: 'Fourth',
    },
    {
        id: 'fifth',
        header: 'Fifth',
    },
];

const columns: ColumnDef<unknown>[] = [
    {
        id: 'first',
        header: 'First group',
        columns: [
            {id: 'first-1', header: 'Child 1'},
            {id: 'first-2', header: 'Child 2'},
        ],
    },
    {
        id: 'second',
        header: 'Second group',
        enableHiding: false,
        columns: [
            {id: 'second-1', header: 'Child 1', enableHiding: false},
            {id: 'second-2', header: 'Child 2', enableHiding: false},
        ],
    },
    {
        id: 'third',
        header: 'Third group',
        columns: [
            {id: 'third-1', header: 'Child 1'},
            {id: 'third-2', header: 'Child 2'},
        ],
    },
    {
        id: 'fourth',
        header: 'Fourth group',
        columns: [
            {id: 'fourth-1', header: 'Child 1'},
            {id: 'fourth-2', header: 'Child 2'},
        ],
    },
];

export const TableSettingsStory = (options: TableSettingsOptions) => {
    const onSortingChangeCallback = (newOrdering: string[]) =>
        alert(`Ordering changed.\n${displayOrderingModel(newOrdering)}`);

    const flatTableSettings = useTableSettings({
        initialVisibility: {
            third: false,
            fourth: false,
        },
        initialOrdering: ['first', 'second', 'third', 'fourth', 'fifth'],
        onOrderingChange: onSortingChangeCallback,
    });

    const flatTable = useTable({
        columns: flatColumns,
        data: [],
        state: {
            ...flatTableSettings.state,
        },
        ...flatTableSettings.callbacks,
    });

    const {state, callbacks} = useTableSettings({
        initialVisibility: {
            'first-1': false,
            'first-2': false,
        },
        onOrderingChange: onSortingChangeCallback,
    });

    const table = useTable({
        columns: columns,
        data: [],
        state,
        ...callbacks,
    });

    return (
        <div>
            <div>
                <div>
                    <Text variant="header-2">Flat table</Text>
                </div>
                <TableSettings table={flatTable} {...options} />
                <div>{displayOrderingModel(flatTableSettings.state.columnOrder)}</div>
                <div>{displayVisibilityModel(flatTableSettings.state.columnVisibility)}</div>
            </div>

            <div style={{marginBlockStart: '16px'}}>
                <div>
                    <Text variant="header-2">Grouped table</Text>
                </div>
                <TableSettings table={table} {...options} />

                <div>{displayOrderingModel(state.columnOrder)}</div>
                <div>{displayVisibilityModel(state.columnVisibility)}</div>
            </div>
        </div>
    );
};
