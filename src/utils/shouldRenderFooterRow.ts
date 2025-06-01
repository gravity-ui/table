import type {HeaderGroup} from '../types/base';

export const shouldRenderFooterRow = <TData>(footerGroup: HeaderGroup<TData>) => {
    return footerGroup.headers.some((header) => header.column.columnDef.footer);
};
