import type {TestRunnerConfig} from '@storybook/test-runner';

type TestRunnerPage = Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0];

export async function waitForScrollToSettle(
    page: TestRunnerPage,
    tolerance = 2,
    stableFrameCount = 4,
) {
    return page.evaluate(
        (options) =>
            new Promise<number>((resolve) => {
                let previousScrollTop = window.scrollY;
                let stableFrames = 0;

                const checkScrollPosition = () => {
                    const currentScrollTop = window.scrollY;
                    if (Math.abs(currentScrollTop - previousScrollTop) <= options.tolerance) {
                        stableFrames += 1;
                    } else {
                        stableFrames = 0;
                    }
                    previousScrollTop = currentScrollTop;

                    if (stableFrames >= options.stableFrameCount) {
                        resolve(currentScrollTop);
                        return;
                    }

                    requestAnimationFrame(checkScrollPosition);
                };

                requestAnimationFrame(checkScrollPosition);
            }),
        {stableFrameCount, tolerance},
    );
}
