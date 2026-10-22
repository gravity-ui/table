import type {Cell} from '@tanstack/react-table';

export const canDeferHeavyCellContent = <TData>(cell: Cell<TData, unknown>) =>
    cell.column.id.startsWith('metric-');
