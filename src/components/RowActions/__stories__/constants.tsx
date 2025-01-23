import {Pencil} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

export {columns as baseColumns} from '../../BaseTable/__stories__/constants/columns';
import type {TableActionsSettings} from '../../../types/RowActions';
import type {Item} from '../../BaseTable/__stories__/types';

export const actionsSettings: TableActionsSettings<Item> = {
    getRowActions: (item, index) => [
        {
            text: 'default',
            handler: () => {
                alert(JSON.stringify(item));
            },
        },
        {
            text: 'with icon',
            icon: <Icon data={Pencil} size={14} />,
            handler: () => {},
        },
        {
            text: 'disabled',
            disabled: true,
            handler: () => {},
        },
        {
            text: 'danger theme',
            theme: 'danger',
            handler: () => {
                alert(index);
            },
        },
        {
            text: 'with href',
            theme: 'normal',
            href: 'https://gravity-ui.com',
            target: '_blank',
            rel: 'noopener noreferrer',
            handler: () => {},
        },
    ],
};
