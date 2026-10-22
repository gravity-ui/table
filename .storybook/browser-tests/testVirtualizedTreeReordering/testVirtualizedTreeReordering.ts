import type {TestRunnerConfig} from '@storybook/test-runner';

import {waitForScrollToSettle} from './utils/waitForScrollToSettle';
import {waitForTwoAnimationFrames} from './utils/waitForTwoAnimationFrames';

type TestRunnerPage = Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0];

const STORY_SELECTOR = '[data-qa="virtualized-tree-reordering-scroll"]';

export async function testVirtualizedTreeReordering(page: TestRunnerPage) {
    const sourceKey = 'row-18';
    const story = page.locator(STORY_SELECTOR);

    await story.waitFor();
    await page.waitForFunction(
        (selector) => {
            const element = document.querySelector<HTMLElement>(selector);

            return (
                Boolean(element) &&
                (element?.querySelectorAll('thead th').length ?? 0) >= 20 &&
                (element?.querySelectorAll('[data-heavy-virtualization-cell="true"]').length ?? 0) >
                    0
            );
        },
        STORY_SELECTOR,
        {timeout: 3000},
    );
    await story.evaluate((element) => {
        window.scrollTo({top: window.scrollY + element.getBoundingClientRect().top + 480});
    });
    await waitForTwoAnimationFrames(page);

    const source = page.locator(`tbody tr[data-key="${sourceKey}"]`);

    await source.waitFor();
    await source.scrollIntoViewIfNeeded();
    await waitForTwoAnimationFrames(page);

    const sourceBox = await source.boundingBox();
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const initialScrollTop = await page.evaluate(() => window.scrollY);

    if (!sourceBox) {
        throw new Error('The draggable row must be visible');
    }

    await page.mouse.move(sourceBox.x + 12, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(sourceBox.x + 24, sourceBox.y + sourceBox.height / 2, {steps: 3});
    await page.mouse.move(sourceBox.x + 80, viewportHeight - 4, {
        steps: 8,
    });
    await page.waitForFunction((initial) => window.scrollY > initial, initialScrollTop, {
        timeout: 2000,
    });
    const dragMotion = await source.evaluate(
        (row) =>
            new Promise<Array<{scrollTop: number; top: number; transform: string}>>((resolve) => {
                const samples: Array<{scrollTop: number; top: number; transform: string}> = [];

                const sample = () => {
                    samples.push({
                        scrollTop: window.scrollY,
                        top: row.getBoundingClientRect().top,
                        transform: row.style.transform,
                    });

                    if (samples.length >= 24) {
                        resolve(samples);
                    } else {
                        requestAnimationFrame(sample);
                    }
                };

                requestAnimationFrame(sample);
            }),
    );

    const middleScrollTop = await page.evaluate(() => window.scrollY);

    await page.waitForFunction(
        (previousScrollTop) => window.scrollY > previousScrollTop,
        middleScrollTop,
        {timeout: 2000},
    );

    const edgeScrollTop = await page.evaluate(() => window.scrollY);

    expect(middleScrollTop).toBeGreaterThan(initialScrollTop);
    expect(edgeScrollTop).toBeGreaterThan(middleScrollTop);
    expect(dragMotion.every(({transform}) => transform !== '')).toBe(true);
    expect(dragMotion.at(-1)?.scrollTop).toBeGreaterThan(dragMotion[0]?.scrollTop ?? 0);
    expect(
        Math.max(...dragMotion.map(({top}) => top)) - Math.min(...dragMotion.map(({top}) => top)),
    ).toBeLessThanOrEqual(1);

    const targetKey = await story.evaluate((element, draggedKey) => {
        const viewportCenter = window.innerHeight / 2;

        return Array.from(element.querySelectorAll<HTMLTableRowElement>('tbody tr[data-key]'))
            .filter((row) => {
                const rect = row.getBoundingClientRect();
                const rowNumber = Number(row.dataset.key?.replace('row-', ''));

                return (
                    row.dataset.key !== draggedKey &&
                    rowNumber > 18 &&
                    rect.top >= 40 &&
                    rect.bottom <= window.innerHeight - 8
                );
            })
            .sort((left, right) => {
                const leftRect = left.getBoundingClientRect();
                const rightRect = right.getBoundingClientRect();
                const leftDistance = Math.abs(
                    viewportCenter - (leftRect.top + leftRect.bottom) / 2,
                );
                const rightDistance = Math.abs(
                    viewportCenter - (rightRect.top + rightRect.bottom) / 2,
                );

                return leftDistance - rightDistance;
            })[0]?.dataset.key;
    }, sourceKey);

    if (!targetKey) {
        throw new Error('No visible drop target was found after auto-scrolling');
    }

    const target = page.locator(`tbody tr[data-key="${targetKey}"]`);
    const targetBox = await target.boundingBox();

    if (!targetBox) {
        throw new Error('The selected drop target must be visible');
    }

    await page.mouse.move(targetBox.x + 80, targetBox.y + targetBox.height / 2, {steps: 8});
    await page.waitForFunction(
        () => document.querySelector('tbody tr[data-expanded="true"]') !== null,
        undefined,
        {timeout: 2000},
    );
    const parentKey = await page.locator('tbody tr[data-expanded="true"]').getAttribute('data-key');

    if (!parentKey) {
        throw new Error('The highlighted parent row must expose its stable key');
    }

    await page.mouse.up();

    await page.waitForFunction(
        ({draggedKey, expectedParentKey}) =>
            document
                .querySelector(`tbody tr[data-row-id="${draggedKey}"]`)
                ?.getAttribute('data-parent-id') === expectedParentKey,
        {draggedKey: sourceKey, expectedParentKey: parentKey},
        {timeout: 3000},
    );
    const settledScrollTop = await waitForScrollToSettle(page);
    const measurement = await story.evaluate((element, draggedKey) => {
        const rows = Array.from(
            element.querySelectorAll<HTMLTableRowElement>('tbody tr[data-row-id]'),
        );
        const rowIds = rows.map((row) => row.dataset.rowId);
        const rects = rows
            .map((row) => ({id: row.dataset.rowId, rect: row.getBoundingClientRect()}))
            .sort((left, right) => left.rect.top - right.rect.top);

        return {
            draggedDepth: element.querySelector<HTMLTableRowElement>(
                `tbody tr[data-row-id="${draggedKey}"]`,
            )?.dataset.depth,
            duplicateRowIds: rowIds.filter((rowId, position) => rowIds.indexOf(rowId) !== position),
            invalidHeights: rects.filter(({rect}) => rect.height <= 0).map(({id}) => id),
            overlappingPairs: rects.slice(1).flatMap(({id, rect}, index) => {
                const previous = rects[index];

                return previous && rect.top < previous.rect.bottom - 0.5
                    ? [`${previous.id}:${id}`]
                    : [];
            }),
            sourceCount: rowIds.filter((rowId) => rowId === draggedKey).length,
        };
    }, sourceKey);

    expect(settledScrollTop).toBeGreaterThan(initialScrollTop);
    expect(measurement.draggedDepth).toBe('1');
    expect(measurement.duplicateRowIds).toEqual([]);
    expect(measurement.invalidHeights).toEqual([]);
    expect(measurement.overlappingPairs).toEqual([]);
    expect(measurement.sourceCount).toBe(1);
}
