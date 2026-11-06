import type {ColumnDef} from '../../../types/base';

export function getNativeColumnId<T>(column: ColumnDef<T>): string {
    return (
        column.id ??
        ('accessorKey' in column
            ? String(column.accessorKey).replace(/\./g, '_')
            : typeof column.header === 'string'
              ? column.header
              : '')
    );
}
