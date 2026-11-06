import type {TestRunnerConfig} from '@storybook/test-runner';
type Page = Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0];
export async function testNativeWidths(page: Page) {
    await page.waitForFunction(
        () => document.querySelectorAll('[data-qa="native-fixture"] td').length >= 6,
    );
    await page.waitForTimeout(50);
    await page
        .locator('[data-qa="native-fixture"] table[hidden]')
        .evaluateAll((tables) => tables.forEach((table) => table.removeAttribute('hidden')));
    const verify = async () => {
        await page.waitForFunction(() =>
            Array.from(document.querySelectorAll('[data-qa="native-fixture"]')).every((fixture) => {
                const cell = fixture.querySelector('td');
                const text = cell?.querySelector('[data-qa="native-text"]');
                if (!cell || !text) return false;
                const style = getComputedStyle(cell);
                const expected = Math.max(
                    100,
                    text.getBoundingClientRect().width +
                        parseFloat(style.paddingLeft) +
                        parseFloat(style.paddingRight),
                );
                const actual = parseFloat(style.width);
                return Math.abs(expected - actual) < 2;
            }),
        );
    };
    await verify();
    const initial = await page
        .locator('[data-qa="native-fixture"] td')
        .evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).width));
    // Hide only tables: parent viewport dimensions stay unchanged.
    await page.locator('[data-qa="native-fixture"] table').evaluateAll((tables) =>
        tables.forEach((table) => {
            (table as HTMLElement).style.display = 'none';
        }),
    );
    await page.waitForTimeout(50);
    await page.locator('[data-qa="native-fixture"] table').evaluateAll((tables) =>
        tables.forEach((table) => {
            (table as HTMLElement).style.display = '';
        }),
    );
    await verify();
    await page.locator('[data-qa="native-fixture"]').evaluateAll((fixtures) =>
        fixtures.forEach((fixture) => {
            (fixture as HTMLElement).style.transform = 'scale(.5)';
            (fixture as HTMLElement).style.width = '620px';
        }),
    );
    await page.waitForTimeout(100);
    const scaled = await page
        .locator('[data-qa="native-fixture"] td')
        .evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).width));
    if (JSON.stringify(initial) !== JSON.stringify(scaled))
        throw new Error('Scale changed native column widths');
}
