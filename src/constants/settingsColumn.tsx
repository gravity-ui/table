import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {TableSettings} from '../components/TableSettings/TableSettings';
import type {TableSettingsOptions} from '../components/TableSettings/TableSettings';

const SETTINGS_COLUMN_ID = '_settings';
const SETTINGS_COLUMN_SIZE = 32;

export const settingsColumn: ColumnDef<unknown> = {
    id: SETTINGS_COLUMN_ID,
    accessorKey: SETTINGS_COLUMN_ID,
    header: (context) => <TableSettings {...context} columnId={SETTINGS_COLUMN_ID} />,
    size: SETTINGS_COLUMN_SIZE,
    minSize: SETTINGS_COLUMN_SIZE,
};

export const getSettingsColumn = <TData extends unknown>(
    options?: TableSettingsOptions,
): ColumnDef<TData> => {
    return {
        id: SETTINGS_COLUMN_ID,
        accessorKey: SETTINGS_COLUMN_ID,
        header: (context) => (
            <TableSettings {...context} {...options} columnId={SETTINGS_COLUMN_ID} />
        ),
        size: SETTINGS_COLUMN_SIZE,
        minSize: SETTINGS_COLUMN_SIZE,
    };
};
