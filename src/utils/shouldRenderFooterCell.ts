import type {Header} from '../types/tanstack';

export const shouldRenderFooterCell = <TData>(header: Header<TData, unknown>) => {
    return !header.isPlaceholder;
};
