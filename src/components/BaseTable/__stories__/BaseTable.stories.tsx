import type {Meta, StoryObj} from '@storybook/react';

import {BaseTable} from '../index';

import {ColumnPinningStory} from './stories/ColumnPinningStory';
import {DefaultStory} from './stories/DefaultStory';
import {EmptyContentStory} from './stories/EmptyContentStory';
import {GroupingStory} from './stories/GroupingStory';
import {GroupingStory2} from './stories/GroupingStory2';
import {GroupingWithSelectionStory} from './stories/GroupingWithSelectionStory';
import {GroupingWithVirtualizationStory} from './stories/GroupingWithVirtualizationStory';
import {HeaderGroupsStory} from './stories/HeaderGroupsStory';
import {ReorderingStory} from './stories/ReorderingStory';
import {ReorderingTreeStory} from './stories/ReorderingTreeStory';
import {ReorderingWithVirtualizationStory} from './stories/ReorderingWithVirtualizationStory';
import {ResizingStory} from './stories/ResizingStory';
import {SortingStory} from './stories/SortingStory';
import {StickyHeaderStory} from './stories/StickyHeaderStory';
import {TreeStory} from './stories/TreeStory';
import {TreeWithGroupsStory} from './stories/TreeWithGroupsStory';
import {VirtualizationStory} from './stories/VirtualizationStory';
import {WindowVirtualizationStory} from './stories/WindowVirtualizationStory';
import {WithSelectionStory} from './stories/WithSelectionStory';
import {WithoutHeaderStory} from './stories/WithoutHeaderStory';

const meta: Meta<typeof BaseTable> = {
    title: 'BaseTable',
    component: BaseTable,
};

export default meta;

export const Default: StoryObj<typeof DefaultStory> = {
    render: DefaultStory,
};

export const WithoutHeader: StoryObj<typeof WithoutHeaderStory> = {
    render: WithoutHeaderStory,
};

export const HeaderGroups: StoryObj<typeof HeaderGroupsStory> = {
    render: HeaderGroupsStory,
};

export const WithSelection: StoryObj<typeof WithSelectionStory> = {
    render: WithSelectionStory,
};

export const Sorting: StoryObj<typeof SortingStory> = {
    render: SortingStory,
};

export const Grouping: StoryObj<typeof GroupingStory> = {
    render: GroupingStory,
};

export const Grouping2: StoryObj<typeof GroupingStory2> = {
    render: GroupingStory2,
};

export const GroupingWithSelection: StoryObj<typeof GroupingWithSelectionStory> = {
    render: GroupingWithSelectionStory,
};

export const Tree: StoryObj<typeof TreeStory> = {
    render: TreeStory,
};

export const TreeWithGroups: StoryObj<typeof TreeWithGroupsStory> = {
    render: TreeWithGroupsStory,
};

export const Reordering: StoryObj<typeof ReorderingStory> = {
    render: ReorderingStory,
};

export const ReorderingTree: StoryObj<typeof ReorderingTreeStory> = {
    render: ReorderingTreeStory,
};

export const Virtualization: StoryObj<typeof VirtualizationStory> = {
    render: VirtualizationStory,
};

export const WindowVirtualization: StoryObj<typeof WindowVirtualizationStory> = {
    render: WindowVirtualizationStory,
};

export const GroupingWithVirtualization: StoryObj<typeof GroupingWithVirtualizationStory> = {
    render: GroupingWithVirtualizationStory,
};

export const ReorderingWithVirtualization: StoryObj<typeof ReorderingWithVirtualizationStory> = {
    render: ReorderingWithVirtualizationStory,
};

export const Resizing: StoryObj<typeof ResizingStory> = {
    render: ResizingStory,
};

export const ColumnPinning: StoryObj<typeof ColumnPinningStory> = {
    render: ColumnPinningStory,
};

export const StickyHeader: StoryObj<typeof StickyHeaderStory> = {
    render: StickyHeaderStory,
};

export const EmptyContent: StoryObj<typeof EmptyContentStory> = {
    render: EmptyContentStory,
};
