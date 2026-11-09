import * as React from 'react';

import type {Placement} from '@floating-ui/dom';
import {autoUpdate, computePosition, flip, offset, shift} from '@floating-ui/dom';
import {Ellipsis} from '@gravity-ui/icons';
import {Button, Icon, Menu} from '@gravity-ui/uikit';

import {useIsomorphicLayoutEffect} from '../../hooks/useIsomorphicLayoutEffect';
import type {TableActionConfig, TableActionsSettings} from '../../types/RowActions';
import {RowActionsMenuContent} from '../RowActionsMenu';

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

type RowActionsPopupProps<TValue> = Pick<RowActionsProps<TValue>, 'item' | 'rowActionsSize'> & {
    actions: TableActionConfig<TValue>[];
};

const DEFAULT_PLACEMENT = 'bottom-end';
const POPUP_PADDING = 4;
const placementMiddleware = [
    offset(4),
    shift({padding: POPUP_PADDING}),
    flip({padding: POPUP_PADDING, fallbackPlacements: ['top-end', 'left', 'right']}),
];

export function RowActions<TValue>({
    index,
    item,
    getRowActions,
    rowActionsSize,
}: RowActionsProps<TValue>) {
    const actions = getRowActions?.(item, index);
    if (!actions?.length) {
        return null;
    }

    return <RowActionsPopup actions={actions} item={item} rowActionsSize={rowActionsSize} />;
}

function RowActionsPopup<TValue>({actions, item, rowActionsSize}: RowActionsPopupProps<TValue>) {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const [menuContent, setMenuContent] = React.useState<HTMLDivElement | null>(null);
    const [placement, setPlacement] = React.useState<Placement>(DEFAULT_PLACEMENT);
    const [open, setOpen] = React.useState(false);

    useIsomorphicLayoutEffect(() => {
        const trigger = triggerRef.current;
        const menu = menuContent?.closest<HTMLElement>('[role="menu"]');
        if (!trigger || !menu) {
            return undefined;
        }

        // Choose a fallback placement here because UIKit Menu's flip middleware
        // only uses the first placement. UIKit still handles the final coordinates.
        let updateId = 0;
        const stopUpdating = autoUpdate(trigger, menu, async () => {
            const id = ++updateId;
            const result = await computePosition(trigger, menu, {
                placement: DEFAULT_PLACEMENT,
                middleware: placementMiddleware,
            });

            if (id === updateId) {
                setPlacement(result.placement);
            }
        });

        return () => {
            updateId++;
            stopUpdating();
        };
    }, [menuContent]);

    return (
        <div className={b()}>
            <Menu
                className={b('popup-menu')}
                open={open}
                onOpenChange={setOpen}
                placement={placement}
                size={rowActionsSize}
                trigger={
                    <Button
                        ref={triggerRef}
                        view="flat-secondary"
                        size={rowActionsSize}
                        className={b('actions-button')}
                        // Preserve the button role inside an ancestor floating container.
                        role="button"
                        aria-label={i18n('label-actions')}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Icon data={Ellipsis} />
                    </Button>
                }
            >
                <RowActionsMenuContent
                    contentRef={setMenuContent}
                    item={item}
                    actions={actions}
                    itemClassName={b('popup-menu-item')}
                    onAction={() => setOpen(false)}
                />
            </Menu>
        </div>
    );
}
