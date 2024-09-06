import React from 'react';

import type {Meta, StoryFn} from '@storybook/react';

import {Table} from '../Table';

import {DefaultDemo} from './components/Table/DefaultDemo';
import {StickyHeaderDemo} from './components/Table/StickyHeaderDemo';
import {VirtualizationDemo} from './components/Table/VirtualizationDemo';
import {WindowVirtualizationDemo} from './components/Table/WindowVirtualizationDemo';

export default {
    title: 'Table',
    component: Table,
} as Meta<typeof Table>;

const DefaultTemplate: StoryFn = () => <DefaultDemo />;
export const Default: StoryFn = DefaultTemplate.bind({});

const VirtualizationTemplate: StoryFn = () => <VirtualizationDemo />;
export const Virtualization: StoryFn = VirtualizationTemplate.bind({});

const WindowVirtualizationTemplate: StoryFn = () => <WindowVirtualizationDemo />;
export const WindowVirtualization: StoryFn = WindowVirtualizationTemplate.bind({});

const StickyHeaderTamplate: StoryFn = () => <StickyHeaderDemo />;
export const StickyHeader: StoryFn = StickyHeaderTamplate.bind({});
