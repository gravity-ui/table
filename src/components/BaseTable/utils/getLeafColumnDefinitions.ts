import type {ColumnDef} from '../../../types/base';

export function getLeafColumnDefinitions<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
    return columns.flatMap((column) =>
        'columns' in column && column.columns ? getLeafColumnDefinitions(column.columns) : [column],
    );
}
