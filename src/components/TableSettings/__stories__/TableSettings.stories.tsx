import type {Meta, StoryObj} from '@storybook/react';

import type {TableSettingsOptions} from '../TableSettings';

import {FlatTableSettingsColumnWithSearchStory} from './stories/FlatTableSettingsColumnWithSearchStory';
import {NestedTableSettingsColumnWithSearchStory} from './stories/NestedTableSettingsColumnWithSearchStory';
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

export const NestedTableSettingsColumnWithSearch: StoryObj<typeof TableSettingsColumnStory> = {
    render: NestedTableSettingsColumnWithSearchStory.bind(null, {
        sortable: true,
        filterable: true,
        enableSearch: true,
    }),
};

export const FlatTableSettingsColumnWithSearch: StoryObj<typeof TableSettingsColumnStory> = {
    render: FlatTableSettingsColumnWithSearchStory.bind(null, {
        sortable: true,
        filterable: true,
        enableSearch: true,
    }),
};
