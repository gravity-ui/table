import React from 'react';

import type {ColumnDef} from '@tanstack/react-table';

export interface UseColumnsParams<TData> {
    columns: ColumnDef<TData>[];
    dragHandleColumn: ColumnDef<TData>;
    draggable?: boolean;
    enableRowSelection?: boolean;
    selectionColumn: ColumnDef<TData>;
}

export function useColumns<TData>({
    columns: providedColumns,
    dragHandleColumn,
    draggable,
    enableRowSelection,
    selectionColumn,
}: UseColumnsParams<TData>) {
    return React.useMemo(() => {
        const result = [...providedColumns];

        if (enableRowSelection) {
            result.unshift(selectionColumn);
        }

        if (draggable) {
            result.unshift(dragHandleColumn);
        }

        return result;
    }, [providedColumns, enableRowSelection, draggable, selectionColumn, dragHandleColumn]);
}
