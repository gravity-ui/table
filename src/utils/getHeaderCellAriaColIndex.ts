import type {Header} from '@tanstack/react-table';

export const getHeaderCellAriaColIndex = <TData>(header: Header<TData, unknown>): number => {
    return header.headerGroup.headers
        .slice(0, header.index)
        .reduce((acc, value) => acc + value.colSpan, 1);
};
