import type {Meta, StoryObj} from '@storybook/react';

import {TableSettingsColumnStory} from './stories/TableSettingsColumnStory';
import {TableSettingsStory} from './stories/TableSettingsStory';

const meta: Meta<typeof TableSettings> = {
    title: 'Table settings',
    component: TableSettingsStory,
};

export default meta;

export const TableSettings: StoryObj<typeof TableSettingsStory> = {
    render: TableSettingsStory,
};

export const TableSettingsColumn: StoryObj<typeof TableSettingsColumnStory> = {
    render: TableSettingsColumnStory,
};
