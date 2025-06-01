import type {Header} from '../types/base';

export const getHeaderCellAriaColIndex = <TData, TValue = unknown>(
    header: Header<TData, TValue>,
): number => {
    return header.headerGroup.headers
        .slice(0, header.index)
        .reduce((acc, value) => acc + value.colSpan, 1);
};
