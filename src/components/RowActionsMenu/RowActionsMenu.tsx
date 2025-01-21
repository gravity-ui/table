import type * as React from 'react';

import {Menu} from '@gravity-ui/uikit';

import type {TableActionConfig, TableActionsSettings} from '../../types/RowActions';

import {isActionGroup} from './RowActionsMenu.utils';

interface RowActionsMenuProps<TValue extends unknown> {
    size: TableActionsSettings<TValue>['rowActionsSize'];
    item: TValue;
    actions: TableActionConfig<TValue>[];
    onMenuItemClick: () => unknown;
    className?: string;
    itemClassName?: string;
}

export const RowActionsMenu = <TValue extends unknown>({
    item,
    actions,
    size,
    onMenuItemClick,
    className,
    itemClassName,
}: RowActionsMenuProps<TValue>) => {
    const renderPopupMenuItem = (action: TableActionConfig<TValue>, index: number) => {
        if (isActionGroup(action)) {
            return (
                <Menu.Group key={index} label={action.title}>
                    {action.items.map(renderPopupMenuItem)}
                </Menu.Group>
            );
        }

        const {text, icon, handler, href, ...restProps} = action;

        const handleMenuItemClick = (
            event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement, MouseEvent>,
        ) => {
            event.stopPropagation();
            handler(item, index, event);
            onMenuItemClick();
        };

        return (
            <Menu.Item
                key={index}
                onClick={handleMenuItemClick}
                href={typeof href === 'function' ? href(item, index) : href}
                iconStart={icon}
                className={itemClassName}
                {...restProps}
            >
                {text}
            </Menu.Item>
        );
    };

    return (
        <Menu className={className} size={size}>
            {actions.map(renderPopupMenuItem)}
        </Menu>
    );
};
