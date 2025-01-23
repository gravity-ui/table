import * as React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import type {PopupPlacement} from '@gravity-ui/uikit';
import {Button, Icon, Popup, useUniqId} from '@gravity-ui/uikit';

import type {TableActionsSettings} from '../../types/RowActions';
import {RowActionsMenu} from '../RowActionsMenu';

import {b} from './RowActions.classname';
import i18n from './i18n';

import './RowActions.scss';

type RowActionsProps<TValue> = Pick<
    TableActionsSettings<TValue>,
    'getRowActions' | 'rowActionsSize'
> & {
    item: TValue;
    index: number;
};

const POPUP_PLACEMENT: PopupPlacement = ['bottom-end', 'top-end', 'left', 'right'];

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
                placement={POPUP_PLACEMENT}
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
                        className={b('popup-menu')}
                        itemClassName={b('popup-menu-item')}
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
