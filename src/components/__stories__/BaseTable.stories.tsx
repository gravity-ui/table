import React from 'react';

import type {Meta, StoryFn} from '@storybook/react';

import {BaseTable} from '../BaseTable';

import {ColumnPinningDemo} from './components/BaseTable/ColumnPinningDemo';
import {ColumnPinningWithReorderingDemo} from './components/BaseTable/ColumnPinningWithReorderingDemo';
import {ColumnPinningWithSelectionDemo} from './components/BaseTable/ColumnPinningWithSelectionDemo';
import {DefaultDemo} from './components/BaseTable/DefaultDemo';
import {EmptyContentDemo} from './components/BaseTable/EmptyContent';
import {GroupingDemo} from './components/BaseTable/GroupingDemo';
import {GroupingDemo2} from './components/BaseTable/GroupingDemo2';
import {GroupingWithSelectionDemo} from './components/BaseTable/GroupingWithSelectionDemo';
import {HeaderGroupsDemo} from './components/BaseTable/HeaderGroupsDemo';
import {ReorderingDemo} from './components/BaseTable/ReorderingDemo';
import {ReorderingTreeDemo} from './components/BaseTable/ReorderingTreeDemo';
import {ReorderingWithVirtualizationDemo} from './components/BaseTable/ReorderingWithVirtualizationDemo';
import {ResizingDemo} from './components/BaseTable/ResizingDemo';
import {SortingDemo} from './components/BaseTable/SortingDemo';
import {StickyHeaderDemo} from './components/BaseTable/StickyHeaderDemo';
import {TreeDemo} from './components/BaseTable/TreeDemo';
import {TreeWithGroupsDemo} from './components/BaseTable/TreeWithGroupsDemo';
import {VirtualizationDemo} from './components/BaseTable/VirtualizationDemo';
import {WindowVirtualizationDemo} from './components/BaseTable/WindowVirtualizationDemo';
import {WithSelectionDemo} from './components/BaseTable/WithSelectionDemo';
import {WithoutHeaderDemo} from './components/BaseTable/WithoutHeaderDemo';

export default {
    title: 'BaseTable',
    component: BaseTable,
} as Meta<typeof BaseTable>;

const DefaultTemplate: StoryFn = () => <DefaultDemo />;
export const Default: StoryFn = DefaultTemplate.bind({});

const WithoutHeaderTemplate: StoryFn = () => <WithoutHeaderDemo />;
export const WithoutHeader: StoryFn = WithoutHeaderTemplate.bind({});

const HeaderGroupsTemplate: StoryFn = () => <HeaderGroupsDemo />;
export const HeaderGroups: StoryFn = HeaderGroupsTemplate.bind({});

const WithSelectionTemplate: StoryFn = () => <WithSelectionDemo />;
export const WithSelection: StoryFn = WithSelectionTemplate.bind({});

const SortingTemplate: StoryFn = () => <SortingDemo />;
export const Sorting: StoryFn = SortingTemplate.bind({});

const GroupingTemplate: StoryFn = () => <GroupingDemo />;
export const Grouping: StoryFn = GroupingTemplate.bind({});

const GroupingTemplate2: StoryFn = () => <GroupingDemo2 />;
export const Grouping2: StoryFn = GroupingTemplate2.bind({});

const GroupingWithSelectionTemplate: StoryFn = () => <GroupingWithSelectionDemo />;
export const GroupingWithSelection: StoryFn = GroupingWithSelectionTemplate.bind({});

const TreeTemplate: StoryFn = () => <TreeDemo />;
export const Tree: StoryFn = TreeTemplate.bind({});

const TreeWithGroupsTemplate: StoryFn = () => <TreeWithGroupsDemo />;
export const TreeWithGroups: StoryFn = TreeWithGroupsTemplate.bind({});

const ReorderingTemplate: StoryFn = () => <ReorderingDemo />;
export const Reordering: StoryFn = ReorderingTemplate.bind({});

const ReorderingTreeTemplate: StoryFn = () => <ReorderingTreeDemo />;
export const ReorderingTree: StoryFn = ReorderingTreeTemplate.bind({});

const VirtualizationTemplate: StoryFn = () => <VirtualizationDemo />;
export const Virtualization: StoryFn = VirtualizationTemplate.bind({});

const WindowVirtualizationTemplate: StoryFn = () => <WindowVirtualizationDemo />;
export const WindowVirtualization: StoryFn = WindowVirtualizationTemplate.bind({});

const ReorderingWithVirtualizationTemplate: StoryFn = () => <ReorderingWithVirtualizationDemo />;
export const ReorderingWithVirtualization: StoryFn = ReorderingWithVirtualizationTemplate.bind({});

const ResizingTemplate: StoryFn = () => <ResizingDemo />;
export const Resizing: StoryFn = ResizingTemplate.bind({});

const ColumnPinningTemplate: StoryFn = () => <ColumnPinningDemo />;
export const ColumnPinning: StoryFn = ColumnPinningTemplate.bind({});

const ColumnPinningWithReorderingTemplate: StoryFn = () => <ColumnPinningWithReorderingDemo />;
export const ColumnPinningWithReordering: StoryFn = ColumnPinningWithReorderingTemplate.bind({});

const ColumnPinningWithSelectionTemplate: StoryFn = () => <ColumnPinningWithSelectionDemo />;
export const ColumnPinningWithSelection: StoryFn = ColumnPinningWithSelectionTemplate.bind({});

const StickyHeaderTamplate: StoryFn = () => <StickyHeaderDemo />;
export const StickyHeader: StoryFn = StickyHeaderTamplate.bind({});

const EmptyContentTamplate: StoryFn = () => <EmptyContentDemo />;
export const EmptyContent: StoryFn = EmptyContentTamplate.bind({});
