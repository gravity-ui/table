import type {TestRunnerConfig} from '@storybook/test-runner';
import {toMatchImageSnapshot} from 'jest-image-snapshot';

const config: TestRunnerConfig = {
    setup() {
        expect.extend({toMatchImageSnapshot});
    },
    async postVisit(page) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await expect(await page.screenshot()).toMatchImageSnapshot({
            failureThreshold: 110,
        });
    },
};

module.exports = config;
