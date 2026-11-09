import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {RowActionsColumnStory} from './stories/RowActionsColumnStory';
import {RowActionsWithActionsColumnStory} from './stories/RowActionsWithActionsColumnStory';
import {RowActionsWithCustomRendering} from './stories/RowActionsWithCustomRendering';

const meta: Meta = {
    title: 'Table actions',
};

export default meta;

export const ActionsColumn: StoryObj<typeof RowActionsColumnStory> = {
    render: RowActionsColumnStory,
    tags: ['browser-regression'],
};

export const CustomActions: StoryObj<typeof RowActionsWithCustomRendering> = {
    render: RowActionsWithCustomRendering,
};

export const SettingsWithActionsColumn: StoryObj<typeof RowActionsWithActionsColumnStory> = {
    render: RowActionsWithActionsColumnStory,
};
