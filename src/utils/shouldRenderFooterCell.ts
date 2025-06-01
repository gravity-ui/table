import type {Header} from '../types/base';

export const shouldRenderFooterCell = <TData>(header: Header<TData, unknown>) => {
    return !header.isPlaceholder;
};
