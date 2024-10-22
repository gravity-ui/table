import React from 'react';

import type {CellContext} from '@tanstack/react-table';

import {RowActions} from './RowActions';
import type {TableActionsSettings} from './types';

export const ACTIONS_COLUMN_ID = '_actions';

interface ActionsCellProps<TValue extends unknown> extends TableActionsSettings<TValue> {
    cellContext: CellContext<TValue, unknown>;
}

export const ActionsCell = <TValue extends unknown>({
    getRowActions,
    renderRowActions,
    rowActionsSize,
    cellContext,
}: ActionsCellProps<TValue>) => {
    const {original: item, index} = cellContext.row;

    if (renderRowActions) {
        return renderRowActions({row: cellContext.row});
    }

    return (
        <RowActions<TValue>
            item={item}
            index={index}
            getRowActions={getRowActions}
            rowActionsSize={rowActionsSize}
        />
    );
};
