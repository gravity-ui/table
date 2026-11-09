import * as React from 'react';

import {MenuDivider, MenuItem, useForkRef, useUniqId} from '@gravity-ui/uikit';

import type {TableAction, TableActionConfig} from '../../types/RowActions';
import {block} from '../../utils';

import {isActionGroup} from './RowActionsMenu.utils';

import './RowActionsMenu.scss';

const b = block('row-actions-menu');

interface RowActionsMenuContentProps<TValue> {
    contentRef: React.Ref<HTMLDivElement>;
    item: TValue;
    actions: TableActionConfig<TValue>[];
    itemClassName?: string;
    onAction: () => void;
}

type ActionElement = HTMLDivElement | HTMLAnchorElement;

interface ActionItemProps extends React.HTMLAttributes<ActionElement> {
    href?: string;
    target?: string;
    rel?: string;
    onActionClick: React.MouseEventHandler<ActionElement>;
}

// UIKit's ListItemView drops clicks from focusable descendants. Handle the
// click on the root element so a custom label can still stop propagation.
const ActionItem = React.forwardRef<ActionElement, ActionItemProps>(function RowActionItem(
    {href, target, rel, onActionClick, ...props},
    ref,
) {
    const elementRef = useForkRef(ref);
    const Element = href ? 'a' : 'div';
    const linkProps = href
        ? {href, target, rel: target === '_blank' && !rel ? 'noopener noreferrer' : rel}
        : undefined;

    return <Element {...props} {...linkProps} ref={elementRef} onClick={onActionClick} />;
});

function normalizeIcon(icon: React.ReactNode): React.ReactElement | undefined {
    if (icon === undefined || icon === null || typeof icon === 'boolean') {
        return undefined;
    }

    return React.isValidElement(icon) ? icon : <React.Fragment>{icon}</React.Fragment>;
}

// UIKit mounts this content when the popup opens. Resolve action links at that point.
export function RowActionsMenuContent<TValue>({
    contentRef,
    item,
    actions,
    itemClassName,
    onAction,
}: RowActionsMenuContentProps<TValue>) {
    const groupIdPrefix = useUniqId();

    const renderMenuItem = (action: TableAction<TValue>, index: number, key: React.Key) => {
        const {text, icon, handler, href, target, rel, disabled, theme} = action;
        const resolvedHref = typeof href === 'function' ? href(item, index) : href;

        const handleClick: React.MouseEventHandler<ActionElement> = (event) => {
            event.stopPropagation();
            if (disabled) {
                event.preventDefault();
                return;
            }

            handler(item, index, event);
            onAction();
        };

        const handleKeyDown: React.KeyboardEventHandler<ActionElement> = (event) => {
            // Links already activate on Enter.
            const shouldActivate = event.key === ' ' || (!resolvedHref && event.key === 'Enter');
            if (!event.defaultPrevented && shouldActivate) {
                event.preventDefault();
                event.currentTarget.click();
            }
        };

        return (
            <MenuItem
                key={key}
                component={ActionItem}
                className={itemClassName}
                disabled={disabled}
                icon={normalizeIcon(icon)}
                href={resolvedHref}
                target={target}
                rel={rel}
                theme={theme}
                onActionClick={handleClick}
                onKeyDown={disabled ? undefined : handleKeyDown}
            >
                {text}
            </MenuItem>
        );
    };

    const renderActions = (
        currentActions: TableActionConfig<TValue>[],
        keyPrefix = '',
    ): React.ReactElement[] =>
        currentActions.flatMap((action, index) => {
            const key = `${keyPrefix}${index}`;

            if (!isActionGroup(action)) {
                return [renderMenuItem(action, index, key)];
            }

            const nextAction = currentActions[index + 1];
            const nodes: React.ReactElement[] = [];

            if (index > 0) {
                nodes.push(<MenuDivider key={`${key}-divider-before`} />);
            }

            const labelId = `${groupIdPrefix}-${key}`;
            nodes.push(
                <div key={key} role="group" aria-labelledby={labelId}>
                    <div id={labelId} className={b('group-label')}>
                        {action.title}
                    </div>
                    {renderActions(action.items, `${key}.`)}
                </div>,
            );

            if (nextAction && !isActionGroup(nextAction)) {
                nodes.push(<MenuDivider key={`${key}-divider-after`} />);
            }

            return nodes;
        });

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div ref={contentRef} onClick={(event) => event.stopPropagation()}>
            {renderActions(actions)}
        </div>
    );
}
