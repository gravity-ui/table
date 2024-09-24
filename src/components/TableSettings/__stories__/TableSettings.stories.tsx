import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import type {TableSettingsOptions} from '../TableSettings';

import {TableSettingsColumnStory} from './stories/TableSettingsColumnStory';
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

export const TableSettings = {
    render: (args) => <TableSettingsStory {...args} />,
} as StoryObj<typeof TableSettingsStory>;

export const TableSettingsColumn = {
    render: (args) => <TableSettingsColumnStory {...args} />,
} as StoryObj<typeof TableSettingsColumnStory>;
