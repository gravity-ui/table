import type {Row} from '@tanstack/react-table';

export function areRowsEqual<TData>(previousRow: Row<TData>, nextRow: Row<TData>) {
    return (
        previousRow.id === nextRow.id &&
        previousRow.original === nextRow.original &&
        previousRow.index === nextRow.index &&
        previousRow.depth === nextRow.depth &&
        previousRow.parentId === nextRow.parentId
    );
}
