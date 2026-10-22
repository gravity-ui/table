import type {Row} from '@tanstack/react-table';

export function resolveRowValue<TData, TValue>(
    deferred: boolean,
    row: Row<TData>,
    value: TValue | ((row: Row<TData>) => TValue) | undefined,
) {
    if (deferred) {
        return undefined;
    }

    return typeof value === 'function' ? (value as (row: Row<TData>) => TValue)(row) : value;
}
