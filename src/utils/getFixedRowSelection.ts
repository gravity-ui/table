import type {RowSelectionState, Updater} from '@tanstack/react-table';

interface RowSelectionProps<T> {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    tableData: T[];
    item: T;
    getSubRows: (item: T) => T[] | undefined;
    getRowId: (row: T) => string;
}
const processItemSelection = <T>({
    rowSelection,
    item,
    getSubRows,
    getRowId,
}: Omit<RowSelectionProps<T>, 'setRowSelection' | 'tableData'>): boolean => {
    let isSelected = false;

    const subRows = getSubRows(item) ?? [];
    const itemId = getRowId(item);

    if (subRows.length > 0) {
        isSelected = subRows.every((subRow) =>
            processItemSelection({item: subRow, rowSelection, getSubRows, getRowId}),
        );
    } else {
        isSelected = rowSelection[itemId] === true;
    }

    if (isSelected) {
        rowSelection[itemId] = true;
    } else if (itemId in rowSelection) {
        delete rowSelection[itemId];
    }

    return isSelected;
};

export const getFixedRowSelection = <T>({
    rowSelection,
    setRowSelection,
    tableData,
    getSubRows,
    getRowId,
}: Omit<RowSelectionProps<T>, 'item'>) => {
    return (rowSelectionUpdater: Updater<RowSelectionState>) => {
        const rowSelectionUpdated =
            typeof rowSelectionUpdater === 'function'
                ? rowSelectionUpdater(rowSelection)
                : rowSelectionUpdater;

        tableData.forEach((item) => {
            processItemSelection({item, rowSelection: rowSelectionUpdated, getSubRows, getRowId});
        });

        setRowSelection(rowSelectionUpdated);
    };
};
