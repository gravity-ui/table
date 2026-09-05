import type {TestRunnerConfig} from '@storybook/test-runner';

type TestRunnerPage = Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0];

export async function testAdaptiveVirtualization(page: TestRunnerPage) {
    const story = page.locator('[data-qa="adaptive-virtualization-scroll"]');

    await story.waitFor();
    await page.waitForFunction(
        () => {
            const element = document.querySelector<HTMLElement>(
                '[data-qa="adaptive-virtualization-scroll"]',
            );

            return (
                Boolean(element) &&
                (element?.querySelectorAll('thead th').length ?? 0) >= 30 &&
                (element?.querySelectorAll('tbody tr[data-depth="2"]').length ?? 0) > 0 &&
                (element?.querySelectorAll('[data-heavy-virtualization-cell="true"]').length ?? 0) >
                    0 &&
                document.documentElement.scrollWidth > window.innerWidth
            );
        },
        undefined,
        {timeout: 3000},
    );
    const workload = await story.evaluate((element) => ({
        columnCount: element.querySelectorAll('thead th').length,
        heavyCellCount: element.querySelectorAll('[data-heavy-virtualization-cell="true"]').length,
        horizontallyScrollable: document.documentElement.scrollWidth > window.innerWidth,
        nestedRowCount: element.querySelectorAll('tbody tr[data-depth="2"]').length,
    }));

    expect(workload.columnCount).toBeGreaterThanOrEqual(30);
    expect(workload.heavyCellCount).toBeGreaterThan(0);
    expect(workload.horizontallyScrollable).toBe(true);
    expect(workload.nestedRowCount).toBeGreaterThan(0);

    const rootToggle = page.locator('tbody tr[data-row-id="domain-0"] button');

    await rootToggle.click();
    await page.waitForFunction(
        () => document.querySelector('tbody tr[data-row-id="service-0-0"]') === null,
        undefined,
        {timeout: 3000},
    );
    await rootToggle.click();
    await page.waitForFunction(
        () => document.querySelector('tbody tr[data-row-id="service-0-0"]') !== null,
        undefined,
        {timeout: 3000},
    );

    const samples = await page.evaluate(async (selector) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) {
            return [];
        }
        const offsets = [0, 80, 160, 240, 320, 400, 520, 640, 800, 720, 560, 400, 240, 80, 0];
        const measurements = [];
        const waitForFrame = () =>
            new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const measure = (target: number, phase: 'first' | 'second') => {
            const headerRect = element.querySelector('thead')?.getBoundingClientRect();
            const viewportTop = Math.max(0, headerRect?.bottom ?? 0);
            const viewportBottom = window.innerHeight;
            const body = element.querySelector('tbody');
            const rows = Array.from(
                element.querySelectorAll<HTMLTableRowElement>('tbody tr[data-index]'),
            );
            const indexes = rows.map((row) => row.dataset.index);
            const visibleDeferredRows = rows.filter((row) => {
                const rect = row.getBoundingClientRect();

                return (
                    row.dataset.virtualizationRowState === 'deferred' &&
                    rect.bottom > viewportTop &&
                    rect.top < viewportBottom
                );
            });
            const invisibleDeferredIndexes = visibleDeferredRows.flatMap((row) => {
                const skeleton = row.querySelector<HTMLElement>(
                    '[data-virtualization-skeleton="true"]',
                );
                const skeletonRect = skeleton?.getBoundingClientRect();
                const opacity = skeleton ? Number(getComputedStyle(skeleton).opacity) : 0;

                return skeletonRect &&
                    skeletonRect.width > 0 &&
                    skeletonRect.height > 0 &&
                    opacity > 0
                    ? []
                    : [row.dataset.index];
            });
            const visibleRects = rows
                .map((row) => row.getBoundingClientRect())
                .filter((rect) => rect.bottom > viewportTop && rect.top < viewportBottom)
                .sort((left, right) => left.top - right.top);
            const gaps = visibleRects.slice(1).map((rect, index) => {
                const previousRect = visibleRects[index];

                return previousRect ? rect.top - previousRect.bottom : 0;
            });
            const overlaps = visibleRects.slice(1).map((rect, index) => {
                const previousRect = visibleRects[index];

                return previousRect ? previousRect.bottom - rect.top : 0;
            });
            const firstVisibleRect = visibleRects[0];
            const lastVisibleRect = visibleRects.at(-1);

            return {
                actualScrollTop: window.scrollY,
                covered:
                    Boolean(firstVisibleRect && lastVisibleRect) &&
                    (firstVisibleRect?.top ?? Number.POSITIVE_INFINITY) <= viewportTop + 2 &&
                    (lastVisibleRect?.bottom ?? Number.NEGATIVE_INFINITY) >= viewportBottom - 2,
                coverage: body?.dataset.virtualizationCoverage,
                duplicateIndexes: indexes.filter(
                    (index, position) => indexes.indexOf(index) !== position,
                ),
                invisibleDeferredIndexes,
                maxGap: Math.max(0, ...gaps),
                maxOverlap: Math.max(0, ...overlaps),
                mountedRows: rows.length,
                phase,
                target,
            };
        };

        for (const target of offsets) {
            window.scrollTo({left: 0, top: target});
            await waitForFrame();
            measurements.push(measure(target, 'first'));
            await waitForFrame();
            measurements.push(measure(target, 'second'));
        }

        return measurements;
    }, '[data-qa="adaptive-virtualization-scroll"]');
    const failures = samples.filter(
        (measurement) =>
            !measurement.covered ||
            !['complete', 'none', 'partial'].includes(measurement.coverage ?? '') ||
            measurement.duplicateIndexes.length > 0 ||
            measurement.invisibleDeferredIndexes.length > 0 ||
            measurement.maxGap > 2 ||
            measurement.maxOverlap > 0.5 ||
            measurement.mountedRows > 54,
    );

    expect(failures).toEqual([]);
}
