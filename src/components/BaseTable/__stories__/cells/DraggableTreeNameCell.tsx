import * as React from 'react';

import type {Row, Table} from '@tanstack/react-table';

import {useDraggableRowDepth} from '../../../../hooks';
import {SortableListContext} from '../../../SortableListContext';

import {TreeNameCell} from './TreeNameCell';

export interface DraggableTreeNameCellProps<TData> {
    row: Row<TData>;
    table: Table<TData>;
    value: string;
}

export const DraggableTreeNameCell = <TData,>({
    row,
    table,
    value,
}: DraggableTreeNameCellProps<TData>) => {
    const {useSortable} = React.useContext(SortableListContext) ?? {};
    const {isDragging = false} = useSortable?.({id: row.id}) ?? {};

    const {depth} = useDraggableRowDepth({row, table, isDragging});

    return (
        <TreeNameCell row={row} depth={depth}>
            {value}
        </TreeNameCell>
    );
};
