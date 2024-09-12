import type {Row} from '@tanstack/react-table';

export const getAriaRowIndexMap = <TData>(rows: Row<TData>[]) => {
    let rowIndex = 1;

    return rows.reduce<Record<string, number>>((acc, row, index, arr) => {
        const newMap = {
            ...acc,
            [row.id]: rowIndex,
        };

        const nextRow = arr[index + 1];
        if (nextRow?.parentId !== row.id) {
            rowIndex += row.getLeafRows().length;
        }
        rowIndex++;

        return newMap;
    }, {});
};
