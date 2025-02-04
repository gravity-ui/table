import type {Row} from '@tanstack/react-table';

export const getAriaRowIndexMap = <TData>(rows: Row<TData>[]) => {
    const map: Record<string, number> = {};
    let rowIndex = 1;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nextRow = rows[i + 1];

        map[row.id] = rowIndex;

        if (nextRow?.parentId !== row.id) {
            const leafRows = row.getLeafRows();
            rowIndex += leafRows.length;
        }
        rowIndex++;
    }

    return map;
};
