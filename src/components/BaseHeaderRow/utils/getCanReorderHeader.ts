import type {Header} from '../../../types/base';

export function getCanReorderHeader<TData, TValue>(header: Header<TData, TValue>) {
    return (
        !header.isPlaceholder &&
        header.subHeaders.length === 0 &&
        header.column.columnDef.enableColumnReordering !== false
    );
}
