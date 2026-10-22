import type {TestRunnerConfig} from '@storybook/test-runner';

type TestRunnerPage = Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0];

export async function waitForTwoAnimationFrames(page: TestRunnerPage) {
    await page.evaluate(
        () =>
            new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            }),
    );
}
