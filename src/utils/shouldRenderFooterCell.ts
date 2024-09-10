import type {Header} from '@tanstack/react-table';

export const shouldRenderFooterCell = <TData>(header: Header<TData, unknown>) => {
    return !header.isPlaceholder;
};
