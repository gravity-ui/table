import type {Meta, StoryObj} from '@storybook/react';

import {TableActionsColumnStory} from './stories/TableActionsColumnStory';
import {TableActionsColumnWithVirtualizationStory} from './stories/TableActionsColumnWithVirtualizationStory';
import {TableSettingsWithActionsColumnStory} from './stories/TableSettingsWithActionsColumnStory';

const meta: Meta = {
    title: 'Table actions',
};

export default meta;

export const ActionsColumn: StoryObj<typeof TableActionsColumnStory> = {
    render: TableActionsColumnStory,
};

export const SettingsWithActionsColumn: StoryObj<typeof TableSettingsWithActionsColumnStory> = {
    render: TableSettingsWithActionsColumnStory,
};

export const ActionsColumnWithVirtualizationStory: StoryObj<
    typeof TableActionsColumnWithVirtualizationStory
> = {
    render: TableActionsColumnWithVirtualizationStory,
};
