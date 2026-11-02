import type {TestRunnerConfig} from '@storybook/test-runner';
import {toMatchImageSnapshot} from 'jest-image-snapshot';

import {testAdaptiveVirtualization} from './browser-tests/testAdaptiveVirtualization/testAdaptiveVirtualization';
import {testDOMMeasurement} from './browser-tests/testDOMMeasurement/testDOMMeasurement';
import {testVirtualizedTreeReordering} from './browser-tests/testVirtualizedTreeReordering/testVirtualizedTreeReordering';

const ADAPTIVE_VIRTUALIZATION_STORY = 'basetable--heavy-table-with-adaptive-virtualization';
const REORDERING_TREE_VIRTUALIZATION_STORY =
    'basetable--heavy-table-with-tree-reordering-and-virtualization';

const config: TestRunnerConfig = {
    setup() {
        expect.extend({toMatchImageSnapshot});
    },
    async postVisit(page, context) {
        if (context.id === 'hooks-usecolumnsautosize--dom-measurement-regression-case') {
            await testDOMMeasurement(page);
            return;
        }
        if (context.id === ADAPTIVE_VIRTUALIZATION_STORY) {
            await testAdaptiveVirtualization(page);
            return;
        }

        if (context.id === REORDERING_TREE_VIRTUALIZATION_STORY) {
            await testVirtualizedTreeReordering(page);
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await expect(await page.screenshot()).toMatchImageSnapshot({
            failureThreshold: 110,
        });
    },
};

module.exports = config;
