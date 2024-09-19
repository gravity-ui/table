import React from 'react';

import {Text} from '@gravity-ui/uikit';
import type {ColumnDef, VisibilityState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {TableSettings} from '../../TableSettings';

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
        columns: [
            {id: 'second-1', header: 'Child 1'},
            {id: 'second-2', header: 'Child 2'},
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

export const TableSettingsStory = () => {
    const [flatColumnVisibility, onFlatColumnVisibilityChange] = React.useState<VisibilityState>({
        third: false,
        fourth: false,
    });
    const [flatColumnOrder, onFlatColumnOrderChange] = React.useState<string[]>([
        'first',
        'second',
        'third',
        'fourth',
        'fifth',
    ]);

    const flatTable = useTable({
        columns: flatColumns,
        data: [],
        state: {
            columnVisibility: flatColumnVisibility,
            columnOrder: flatColumnOrder,
        },
        onColumnVisibilityChange: onFlatColumnVisibilityChange,
        onColumnOrderChange: onFlatColumnOrderChange,
    });

    const [columnVisibility, onColumnVisibilityChange] = React.useState<VisibilityState>({
        'first-1': false,
        'first-2': false,
    });
    const [columnOrder, onColumnOrderChange] = React.useState<string[]>([]);

    const table = useTable({
        columns: columns,
        data: [],
        state: {
            columnVisibility,
            columnOrder,
        },
        onColumnVisibilityChange,
        onColumnOrderChange,
    });

    const displayOrderingModel = (order: string[]) => {
        return `Ordering model: [${order.join(', ')}]`;
    };

    const displayVisibilityModel = (visibility: Record<string, boolean>) => {
        const values = Object.entries(visibility).map(([key, value]) => `${key}: ${value}`);
        return `Visible model: {${values.join(', ')}}`;
    };

    return (
        <div>
            <div>
                <div>
                    <Text variant="header-2">Flat table</Text>
                </div>
                <TableSettings table={flatTable} />
                <div>{displayOrderingModel(flatColumnOrder)}</div>
                <div>{displayVisibilityModel(flatColumnVisibility)}</div>
            </div>

            <div style={{marginBlockStart: '16px'}}>
                <div>
                    <Text variant="header-2">Grouped table</Text>
                </div>
                <TableSettings table={table} />

                <div>{displayOrderingModel(columnOrder)}</div>
                <div>{displayVisibilityModel(columnVisibility)}</div>
            </div>
        </div>
    );
};
