import type {TestRunnerConfig} from '@storybook/test-runner';

type Page = Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0];

/** Compare against real rendered cells, real fonts and real browser layout. */
export async function testDOMMeasurement(page: Page) {
    const status = page.locator('[data-qa="auto-size-width"]');
    await status.waitFor({state: 'attached'});
    if ((await status.textContent()) !== '') throw new Error('Hidden table committed a width');
    await page.locator('[data-qa="auto-size-show"]').click();
    const verify = async () => {
        await page.waitForFunction(() => {
            const node = document.querySelector('[data-qa="auto-size-width"]');
            return node?.getAttribute('data-ready') === 'true' && Number(node.textContent) > 0;
        });
        return page.evaluate(async () => {
            await document.fonts.ready;
            const table = document.querySelector('table.gt-table');
            if (!table) throw new Error('Missing rendered table');
            const measured = Number(
                document.querySelector('[data-qa="auto-size-width"]')?.textContent,
            );
            const probe = document.createElement('div');
            probe.className = table.className;
            probe.style.cssText =
                'position:absolute;visibility:hidden;width:max-content;left:0;top:0';
            document.body.append(probe);
            try {
                let expected = 50;
                for (const cell of table.querySelectorAll('tbody td, tfoot th')) {
                    const clone = cell.cloneNode(true) as HTMLElement;
                    clone.style.width = 'max-content';
                    clone.style.minWidth = '0';
                    clone.style.maxWidth = 'none';
                    clone.style.display = 'block';
                    probe.append(clone);
                    expected = Math.max(expected, Math.ceil(clone.getBoundingClientRect().width));
                    clone.remove();
                }
                expected = Math.min(500, expected);
                if (Math.abs(measured - expected) > 1)
                    throw new Error(`Width ${measured} differs from rendered cells ${expected}`);
                return measured;
            } finally {
                probe.remove();
            }
        });
    };
    const natural = await verify();
    await page.locator('[data-qa="auto-size-scale"]').click();
    const scaled = await verify();
    if (scaled !== natural) throw new Error('Ancestor scale changed auto width');
    await page.locator('[data-qa="auto-size-empty"]').click();
    await verify();
    await page.locator('[data-qa="auto-size-data"]').click();
    await page.waitForFunction(
        (width) =>
            Number(document.querySelector('[data-qa="auto-size-width"]')?.textContent) === width,
        natural,
    );
    await verify();
}
