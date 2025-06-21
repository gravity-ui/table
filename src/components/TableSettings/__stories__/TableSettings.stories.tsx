import type {Meta, StoryObj} from '@storybook/react';

import type {TableSettingsOptions} from '../TableSettings';

import {
    TableSettingsColumnStory,
    TableSettingsColumnWithGroupsStory,
} from './stories/TableSettingsColumnStory';
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
    },
};

export default meta;

export const TableSettings: StoryObj<typeof TableSettingsStory> = {
    render: TableSettingsStory,
};

export const TableSettingsColumn: StoryObj<typeof TableSettingsColumnStory> = {
    render: TableSettingsColumnStory,
};

export const TableSettingsColumnWithGroups: StoryObj<typeof TableSettingsColumnWithGroupsStory> = {
    render: TableSettingsColumnWithGroupsStory,
};
