import type {Meta, StoryObj} from '@storybook/react';

import type {TableSettingsOptions} from '../TableSettings';

import {TableSettingsColumnStory} from './stories/TableSettingsColumnStory';
import {TableSettingsColumnWithSearchStory} from './stories/TableSettingsColumnWithSearchStory';
import {TableSettingsStory} from './stories/TableSettingsStory';

const meta: Meta<TableSettingsOptions> = {
    title: 'Table settings',
    argTypes: {
        sortable: {
            control: 'boolean',
        },
        filterable: {
            control: 'boolean',
        },
        enableSearch: {
            control: 'boolean',
        },
    },
};

export default meta;

export const TableSettings: StoryObj<typeof TableSettingsStory> = {
    render: TableSettingsStory,
};

export const TableSettingsColumn: StoryObj<typeof TableSettingsColumnStory> = {
    render: TableSettingsColumnStory,
};

export const TableSettingsColumnWithSearch: StoryObj<typeof TableSettingsColumnStory> = {
    render: TableSettingsColumnWithSearchStory.bind(null, {
        sortable: true,
        filterable: true,
        enableSearch: true,
    }),
};
