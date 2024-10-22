import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

import {ActionsCell} from '../components';
import type {TableActionsSettings} from '../types/RowActions';

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
        cell: (props) => <ActionsCell {...options} row={props.row} />,
    };
};
