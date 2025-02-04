import type {Row} from '@tanstack/react-table';

export const getAriaRowIndexMap = <TData>(rows: Row<TData>[]) => {
    const map: Record<string, number> = {};
    let rowIndex = 1;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nextRow = rows[i + 1];

        map[row.id] = rowIndex;

        if (nextRow?.parentId !== row.id) {
            rowIndex += row.getLeafRows().length;
        }
        rowIndex++;
    }

    return map;
};
