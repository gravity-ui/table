import type {Meta, StoryObj} from '@storybook/react';

import {Table} from '../index';

import {DefaultStory} from './stories/DefaultStory';
import {ReorderingStory} from './stories/ReorderingStory';
import {ReorderingWithVirtualizationStory} from './stories/ReorderingWithVirtualizationStory';
import {SizeSStory} from './stories/SizeSStory';
import {SortingStory} from './stories/SortingStory';
import {StickyHeaderStory} from './stories/StickyHeaderStory';
import {VirtualizationStory} from './stories/VirtualizationStory';
import {WindowVirtualizationStory} from './stories/WindowVirtualizationStory';
import {WithSelectionStory} from './stories/WithSelectionStory';

const meta: Meta<typeof Table> = {
    title: 'Table',
    component: Table,
    argTypes: {
        verticalAlign: {
            control: {
                type: 'radio',
                options: ['top', 'middle', 'bottom'],
            },
        },
    },
};

export default meta;

export const Default: StoryObj<typeof DefaultStory> = {
    render: DefaultStory,
};

export const WithInteractiveRows: StoryObj<typeof DefaultStory> = {
    render: DefaultStory,
};

WithInteractiveRows.args = {
    onRowClick: (row) => {
        alert(`Row "${row.original.name}" clicked`);
    },
};

export const SizeS: StoryObj<typeof SizeSStory> = {
    render: SizeSStory,
};

export const WithSelection: StoryObj<typeof WithSelectionStory> = {
    render: WithSelectionStory,
};

export const Sorting: StoryObj<typeof SortingStory> = {
    render: SortingStory,
};

export const Reordering: StoryObj<typeof ReorderingStory> = {
    render: ReorderingStory,
};

export const Virtualization: StoryObj<typeof VirtualizationStory> = {
    render: VirtualizationStory,
};

export const WindowVirtualization: StoryObj<typeof WindowVirtualizationStory> = {
    render: WindowVirtualizationStory,
};

export const ReorderingWithVirtualization: StoryObj<typeof ReorderingWithVirtualizationStory> = {
    render: ReorderingWithVirtualizationStory,
};

export const StickyHeader: StoryObj<typeof StickyHeaderStory> = {
    render: StickyHeaderStory,
};
