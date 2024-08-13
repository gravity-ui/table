import type {SortDirection} from '@tanstack/react-table';

export const getAriaSort = (sortDirection: SortDirection | false) => {
    if (!sortDirection) {
        return undefined;
    }

    return sortDirection === 'asc' ? 'ascending' : 'descending';
};
