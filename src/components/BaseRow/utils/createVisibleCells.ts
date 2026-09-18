import type {Cell, Row, Table} from '@tanstack/react-table';
import {createCell} from '@tanstack/react-table';

export function createVisibleCells<TData>(
    table: Table<TData>,
    row: Row<TData>,
    _renderVersion: Readonly<Record<string, unknown>> | undefined,
): Cell<TData, unknown>[] {
    const columns = [
        ...table.getLeftVisibleLeafColumns(),
        ...table.getCenterVisibleLeafColumns(),
        ...table.getRightVisibleLeafColumns(),
    ];

    return columns.map((column) => createCell(table, row, column, column.id));
}
