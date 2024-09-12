import type {Meta, StoryObj} from '@storybook/react';

import {Table} from '../index';

import {DefaultStory} from './stories/DefaultStory';
import {StickyHeaderStory} from './stories/StickyHeaderStory';
import {VirtualizationStory} from './stories/VirtualizationStory';
import {WindowVirtualizationStory} from './stories/WindowVirtualizationStory';

const meta: Meta<typeof Table> = {
    title: 'Table',
    component: Table,
};

export default meta;

export const Default: StoryObj<typeof DefaultStory> = {
    render: DefaultStory,
};

export const Virtualization: StoryObj<typeof VirtualizationStory> = {
    render: VirtualizationStory,
};

export const WindowVirtualization: StoryObj<typeof WindowVirtualizationStory> = {
    render: WindowVirtualizationStory,
};

export const StickyHeader: StoryObj<typeof StickyHeaderStory> = {
    render: StickyHeaderStory,
};
