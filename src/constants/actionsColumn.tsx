import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import type {TableActionsSettings} from '../components';
import {ActionsCell} from '../components';

export const ACTIONS_COLUMN_ID = '_actions';
const ACTIONS_COLUMN_SIZE = 44;

export const getActionsColumn = <TValue extends unknown>(
    columnId = ACTIONS_COLUMN_ID,
    options: TableActionsSettings<TValue>,
): ColumnDef<TValue> => {
    return {
        id: columnId,
        header: '',
        size: ACTIONS_COLUMN_SIZE,
        minSize: ACTIONS_COLUMN_SIZE,
        cell: (props) => <ActionsCell {...options} cellContext={props} />,
    };
};
