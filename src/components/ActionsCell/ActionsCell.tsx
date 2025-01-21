import type {Row} from '@tanstack/react-table';

import type {TableActionsSettings} from '../../types/RowActions';
import {RowActions} from '../RowActions/RowActions';

export const ACTIONS_COLUMN_ID = '_actions';

interface ActionsCellProps<TValue extends unknown> extends TableActionsSettings<TValue> {
    row: Row<TValue>;
}

export const ActionsCell = <TValue extends unknown>({
    getRowActions,
    renderRowActions,
    rowActionsSize,
    row,
}: ActionsCellProps<TValue>) => {
    const {original: item, index} = row;

    if (renderRowActions) {
        return renderRowActions({row});
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
