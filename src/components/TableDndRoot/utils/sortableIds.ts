const ROW_PREFIX = 'row:';
const COLUMN_PREFIX = 'column:';

export function toRowSortableId(id: string) {
    return `${ROW_PREFIX}${id}`;
}

export function toColumnSortableId(id: string) {
    return `${COLUMN_PREFIX}${id}`;
}

export function fromRowSortableId(sortableId: string) {
    return sortableId.slice(ROW_PREFIX.length);
}

export function fromColumnSortableId(sortableId: string) {
    return sortableId.slice(COLUMN_PREFIX.length);
}

export function isRowSortableId(sortableId: string) {
    return sortableId.startsWith(ROW_PREFIX);
}

export function isColumnSortableId(sortableId: string) {
    return sortableId.startsWith(COLUMN_PREFIX);
}
