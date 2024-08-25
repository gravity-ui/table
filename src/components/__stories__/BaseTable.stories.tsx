import React from 'react';

import type {Meta, StoryFn} from '@storybook/react';

import {BaseTable} from '../BaseTable';

import {ColumnPinningDemo} from './ColumnPinningDemo';
import {ColumnPinningWithReorderingDemo} from './ColumnPinningWithReorderingDemo';
import {ColumnPinningWithSelectionDemo} from './ColumnPinningWithSelectionDemo';
import {DefaultDemo} from './DefaultDemo';
import {GroupingDemo} from './GroupingDemo';
import {GroupingDemo2} from './GroupingDemo2';
import {GroupingWithSelectionDemo} from './GroupingWithSelectionDemo';
import {HeaderGroupsDemo} from './HeaderGroupsDemo';
import {ReorderingDemo} from './ReorderingDemo';
import {ReorderingTreeDemo} from './ReorderingTreeDemo';
import {ReorderingWithVirtualizationDemo} from './ReorderingWithVirtualizationDemo';
import {ResizingDemo} from './ResizingDemo';
import {SortingDemo} from './SortingDemo';
import {StickyHeaderDemo} from './StickyHeaderDemo';
import {TreeDemo} from './TreeDemo';
import {TreeWithGroupsDemo} from './TreeWithGroupsDemo';
import {VirtualizationDemo} from './VirtualizationDemo';
import {WindowVirtualizationDemo} from './WindowVirtualizationDemo';
import {WithSelectionDemo} from './WithSelectionDemo';
import {WithoutHeaderDemo} from './WithoutHeaderDemo';

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
