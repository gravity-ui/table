import type {Header} from '@tanstack/react-table';

export const shouldRenderHeaderCell = <TData>(
    header: Header<TData, unknown>,
    parentHeader?: Header<TData, unknown>,
) => {
    const isPlaceholderRowSpannedCell =
        header.isPlaceholder &&
        parentHeader?.isPlaceholder &&
        parentHeader.placeholderId === header.placeholderId;

    const isLeafRowSpannedCell =
        !header.isPlaceholder &&
        header.id === header.column.id &&
        header.depth - header.column.depth > 1;

    return !(isPlaceholderRowSpannedCell || isLeafRowSpannedCell);
};
