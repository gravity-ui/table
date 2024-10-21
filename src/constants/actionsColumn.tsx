import React from 'react';

import type {CellContext, ColumnDef, ColumnDefTemplate} from '@tanstack/react-table';

import type {TableActionsSettings} from '../components';
import {RowActions} from '../components';

export const ACTIONS_COLUMN_ID = '_actions';
const ACTIONS_COLUMN_SIZE = 44;

export const getActionsCell = <TData extends unknown>({
    getRowActions,
    renderRowActions,
    rowActionsSize,
}: TableActionsSettings<TData>): ColumnDefTemplate<CellContext<TData, unknown>> => {
    const ActionsCell = (props: CellContext<TData, unknown>) => {
        const {original: item, index} = props.row;

        if (renderRowActions) {
            return renderRowActions({row: props.row});
        }

        return (
            <RowActions<TData>
                item={item}
                index={index}
                getRowActions={getRowActions}
                rowActionsSize={rowActionsSize}
            />
        );
    };

    ActionsCell.displayName = 'ActionsCell';
    return ActionsCell;
};

export const getActionsColumn = <TData extends unknown>(
    columnId = ACTIONS_COLUMN_ID,
    options: TableActionsSettings<TData>,
): ColumnDef<TData> => {
    return {
        id: columnId,
        header: '',
        size: ACTIONS_COLUMN_SIZE,
        minSize: ACTIONS_COLUMN_SIZE,
        cell: getActionsCell<TData>(options),
    };
};
