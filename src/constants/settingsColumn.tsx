import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {TableSettings} from '../components/TableSettings/TableSettings';
import type {TableSettingsOptions} from '../components/TableSettings/TableSettings';

export const settingsColumn: ColumnDef<unknown> = {
    id: '_settings',
    accessorKey: '_settings',
    header: TableSettings,
    size: 32,
    minSize: 32,
};

export const getSettingsColumn = <TData extends unknown>(
    options?: TableSettingsOptions,
): ColumnDef<TData> => {
    return {
        id: '_settings',
        accessorKey: '_settings',
        header: (context) => <TableSettings {...context} {...options} />,
        size: 32,
        minSize: 32,
    };
};
