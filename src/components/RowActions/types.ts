import type {MenuItemProps} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

export interface TableAction<TValue> {
    text: string;
    handler: (
        item: TValue,
        index: number,
        event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement, MouseEvent>,
    ) => void;
    href?: ((item: TValue, index: number) => string) | string;
    target?: string;
    rel?: string;
    disabled?: boolean;
    theme?: MenuItemProps['theme'];
    icon?: MenuItemProps['iconStart'];
}
export interface TableActionGroup<I> {
    title: string;
    items: TableActionConfig<I>[];
}
export type TableActionConfig<TValue> = TableAction<TValue> | TableActionGroup<TValue>;
/**
 * common sizes for Menu and Button
 */
export type TableRowActionsSize = 's' | 'm' | 'l' | 'xl';
export type RenderRowActionsProps<TValue> = {
    item: TValue;
    index: number;
};
export interface TableActionsSettings<TValue> {
    getRowActions?: (item: TValue, index: number) => TableActionConfig<TValue>[];
    renderRowActions?: (props: {row: Row<TValue>}) => React.ReactNode;
    rowActionsSize?: TableRowActionsSize;
}
