import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import type {PopupPlacement} from '@gravity-ui/uikit';
import {Button, Icon, Menu, Popup, useUniqId} from '@gravity-ui/uikit';

import {block} from '../../utils';

import i18n from './i18n';
import type {TableActionConfig, TableActionGroup, TableActionsSettings} from './types';

import './DefaultRowActions.scss';

type DefaultRowActionsProps<I> = Pick<
    TableActionsSettings<I>,
    'getRowActions' | 'rowActionsSize'
> & {
    item: I;
    index: number;
};

const b = block('table');
const actionsCn = b('actions');
const actionsButtonCn = b('actions-button');

const bPopup = block('table-action-popup');
const menuCn = bPopup('menu');
const menuItemCn = bPopup('menu-item');

const DEFAULT_PLACEMENT: PopupPlacement = ['bottom-end', 'top-end', 'auto'];

const isActionGroup = <I extends unknown>(
    config: TableActionConfig<I>,
): config is TableActionGroup<I> => {
    return Array.isArray((config as TableActionGroup<I>).items);
};

export const DefaultRowActions = <I extends unknown>({
    index: rowIndex,
    item,
    getRowActions,
    rowActionsSize,
}: DefaultRowActionsProps<I>) => {
    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const rowId = useUniqId();

    if (getRowActions === undefined) {
        return null;
    }

    const renderPopupMenuItem = (action: TableActionConfig<I>, index: number) => {
        if (isActionGroup(action)) {
            return (
                <Menu.Group key={index} label={action.title}>
                    {action.items.map(renderPopupMenuItem)}
                </Menu.Group>
            );
        }

        const {text, icon, handler, href, ...restProps} = action;

        return (
            <Menu.Item
                key={index}
                onClick={(event) => {
                    event.stopPropagation();
                    handler(item, index, event);

                    setIsPopupOpen(false);
                }}
                href={typeof href === 'function' ? href(item, index) : href}
                iconStart={icon}
                className={menuItemCn}
                {...restProps}
            >
                {text}
            </Menu.Item>
        );
    };

    const actions = getRowActions(item, rowIndex);

    if (actions.length === 0) {
        return null;
    }

    return (
        <div className={actionsCn}>
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
                    <Menu className={menuCn} size={rowActionsSize}>
                        {actions.map(renderPopupMenuItem)}
                    </Menu>
                </div>
            </Popup>
            <Button
                view="flat-secondary"
                className={actionsButtonCn}
                onClick={(event) => {
                    setIsPopupOpen((value) => !value);
                    event.stopPropagation();
                }}
                size={rowActionsSize}
                ref={anchorRef}
                extraProps={{
                    'aria-label': i18n('label-actions'),
                    'aria-expanded': isPopupOpen,
                    'aria-controls': rowId,
                }}
            >
                <Icon data={Ellipsis} />
            </Button>
        </div>
    );
};
