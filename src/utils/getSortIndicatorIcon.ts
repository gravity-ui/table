import {
    ArrowDown as ArrowDownIcon,
    ArrowUpArrowDown as ArrowUpArrowDownIcon,
    ArrowUp as ArrowUpIcon,
} from '@gravity-ui/icons';
import type {SortDirection} from '@tanstack/react-table';

export const getSortIndicatorIcon = (sortDirection: SortDirection | false) => {
    if (sortDirection === 'asc') {
        return ArrowUpIcon;
    }

    if (sortDirection === 'desc') {
        return ArrowDownIcon;
    }

    return ArrowUpArrowDownIcon;
};
