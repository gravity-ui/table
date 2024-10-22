import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import type {PopupPlacement} from '@gravity-ui/uikit';
import {Button, Icon, Menu, Popup, useUniqId} from '@gravity-ui/uikit';

import {b} from './RowActions.classname';
import i18n from './i18n';
import type {TableActionConfig, TableActionGroup, TableActionsSettings} from './types';

import './RowActions.scss';

type RowActionsProps<TValue> = Pick<
    TableActionsSettings<TValue>,
    'getRowActions' | 'rowActionsSize'
> & {
    item: TValue;
    index: number;
};

const DEFAULT_PLACEMENT: PopupPlacement = ['bottom-end', 'top-end', 'auto'];

const isActionGroup = <TValue extends unknown>(
    config: TableActionConfig<TValue>,
): config is TableActionGroup<TValue> => {
    return Array.isArray((config as TableActionGroup<TValue>).items);
};

interface RowActionsMenuProps<TValue extends unknown> {
    size: TableActionsSettings<TValue>['rowActionsSize'];
    item: TValue;
    actions: TableActionConfig<TValue>[];
    onMenuItemClick: () => unknown;
}

const RowActionsMenu = <TValue extends unknown>({
    item,
    actions,
    size,
    onMenuItemClick,
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
                className={b('popup-menu-item')}
                {...restProps}
            >
                {text}
            </Menu.Item>
        );
    };

    return (
        <Menu className={b('popup-menu')} size={size}>
            {actions.map(renderPopupMenuItem)}
        </Menu>
    );
};

export const RowActions = <TValue extends unknown>({
    index: rowIndex,
    item,
    getRowActions,
    rowActionsSize,
}: RowActionsProps<TValue>) => {
    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const rowId = useUniqId();

    const buttonExtraProps = React.useMemo(
        () => ({
            'aria-label': i18n('label-actions'),
            'aria-expanded': isPopupOpen,
            'aria-controls': rowId,
        }),
        [isPopupOpen, rowId],
    );
    const handleButtonClick = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
            setIsPopupOpen((value) => !value);
            event.stopPropagation();
        },
        [],
    );

    if (getRowActions === undefined) {
        return null;
    }

    const actions = getRowActions(item, rowIndex);

    if (actions.length === 0) {
        return null;
    }

    return (
        <div className={b()}>
            <Popup
                open={isPopupOpen}
                anchorRef={anchorRef}
                placement={DEFAULT_PLACEMENT}
                onOutsideClick={() => setIsPopupOpen(false)}
                id={rowId}
            >
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <RowActionsMenu
                        item={item}
                        actions={actions}
                        size={rowActionsSize}
                        onMenuItemClick={() => setIsPopupOpen(false)}
                    />
                </div>
            </Popup>
            <Button
                view="flat-secondary"
                className={b('actions-button')}
                onClick={handleButtonClick}
                size={rowActionsSize}
                ref={anchorRef}
                extraProps={buttonExtraProps}
            >
                <Icon data={Ellipsis} />
            </Button>
        </div>
    );
};
