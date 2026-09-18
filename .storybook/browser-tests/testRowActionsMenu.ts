import type {TestRunnerConfig} from '@storybook/test-runner';

type TestRunnerPage = Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0];

export async function testRowActionsMenu(page: TestRunnerPage) {
    const trigger = page.getByRole('button', {name: 'Actions'}).first();
    await trigger.press('ArrowDown');

    const menu = page.getByRole('menu', {name: 'Actions'});
    const focused = page.locator(':focus');
    const firstAction = menu.getByRole('menuitem', {name: 'default'});
    const edit = menu
        .getByRole('group', {name: 'Editing'})
        .getByRole('menuitem', {name: 'with icon'});
    const manage = menu
        .getByRole('group', {name: 'Management'})
        .getByRole('menuitem', {name: 'danger theme'});

    await firstAction.and(focused).waitFor();
    await page.keyboard.press('ArrowDown');
    await edit.and(focused).waitFor();
    await page.keyboard.press('ArrowDown');
    await manage.and(focused).waitFor();

    await page.keyboard.press('Escape');
    await menu.waitFor({state: 'hidden'});
    await trigger.and(focused).waitFor();

    await trigger.press('ArrowDown');
    await firstAction.and(focused).waitFor();
    await page.keyboard.press('ArrowDown');
    await edit.and(focused).waitFor();
    await page.keyboard.press('Enter');
    await menu.waitFor({state: 'hidden'});

    const viewport = page.viewportSize();
    if (!viewport) {
        throw new Error('The row actions placement test requires a fixed viewport');
    }

    await trigger.evaluate((button) => {
        Object.assign(button.style, {position: 'fixed', top: '105px', right: '32px'});
    });
    try {
        await trigger.press('ArrowDown');
        await firstAction.and(focused).waitFor();
        await page.setViewportSize({...viewport, height: 240});
        await page.waitForFunction(
            ({anchor, popup}) => {
                if (!anchor || !popup) {
                    return false;
                }
                const {top, right, bottom} = popup.getBoundingClientRect();
                const gap = anchor.getBoundingClientRect().left - right;
                return gap > 0 && gap < 8 && top >= 0 && bottom <= innerHeight;
            },
            {anchor: await trigger.elementHandle(), popup: await menu.elementHandle()},
        );
        await edit.getByText('with icon').click();
        await menu.waitFor({state: 'hidden'});
    } finally {
        await page.setViewportSize(viewport);
        await trigger.evaluate((button) => {
            for (const property of ['position', 'top', 'right']) {
                button.style.removeProperty(property);
            }
        });
    }
}
