import type {HeaderGroup} from '@tanstack/react-table';

export const shouldRenderFooterRow = <TData>(footerGroup: HeaderGroup<TData>) => {
    return footerGroup.headers.every((header) => !header.column.columnDef.footer);
};
