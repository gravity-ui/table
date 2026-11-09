import type {TestRunnerConfig} from '@storybook/test-runner';
import {toMatchImageSnapshot} from 'jest-image-snapshot';

import {testAdaptiveVirtualization} from './browser-tests/testAdaptiveVirtualization/testAdaptiveVirtualization.ts';
import {testRowActionsMenu} from './browser-tests/testRowActionsMenu.ts';
import {testVirtualizedTreeReordering} from './browser-tests/testVirtualizedTreeReordering/testVirtualizedTreeReordering.ts';

const ADAPTIVE_VIRTUALIZATION_STORY = 'basetable--heavy-table-with-adaptive-virtualization';
const REORDERING_TREE_VIRTUALIZATION_STORY =
    'basetable--heavy-table-with-tree-reordering-and-virtualization';
const ROW_ACTIONS_MENU_STORY = 'table-actions--actions-column';

const config: TestRunnerConfig = {
    setup() {
        expect.extend({toMatchImageSnapshot});
    },
    async postVisit(page, context) {
        if (context.id === ADAPTIVE_VIRTUALIZATION_STORY) {
            await testAdaptiveVirtualization(page);
            return;
        }

        if (context.id === REORDERING_TREE_VIRTUALIZATION_STORY) {
            await testVirtualizedTreeReordering(page);
            return;
        }
        if (context.id === ROW_ACTIONS_MENU_STORY) {
            await testRowActionsMenu(page);
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await expect(await page.screenshot()).toMatchImageSnapshot({
            failureThreshold: 110,
        });
    },
};

export default config;
