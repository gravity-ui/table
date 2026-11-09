import {fireEvent, render, screen, within} from '../../../test-utils/utils';

import {RowActions} from './RowActions';

describe('RowActions', () => {
    it('passes the menu item as currentTarget when its label is clicked', async () => {
        const handler = jest.fn();
        const disabledHandler = jest.fn();

        render(
            <RowActions
                item="row"
                index={0}
                getRowActions={() => [
                    {
                        title: 'Editing',
                        items: [
                            {
                                text: <span tabIndex={-1}>Edit</span>,
                                handler: (_row, _index, event) => handler(event.currentTarget),
                            },
                            {text: 'Delete', handler: disabledHandler, disabled: true},
                        ],
                    },
                ]}
            />,
        );

        const trigger = screen.getByRole('button', {name: 'Actions'});
        fireEvent.click(trigger);

        const group = await screen.findByRole('group', {name: 'Editing'});
        const action = within(group).getByRole('menuitem', {name: 'Edit'});
        fireEvent.click(within(group).getByRole('menuitem', {name: 'Delete'}));
        expect(disabledHandler).not.toHaveBeenCalled();
        fireEvent.click(within(action).getByText('Edit'));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(action);
        expect(action.tagName).toBe('DIV');
    });

    it('lets a custom label stop the click before the action runs', async () => {
        const handler = jest.fn();
        render(
            <RowActions
                item="row"
                index={0}
                getRowActions={() => [
                    {
                        text: (
                            <button type="button" onClick={(event) => event.stopPropagation()}>
                                Custom label
                            </button>
                        ),
                        handler,
                    },
                ]}
            />,
        );

        const trigger = screen.getByRole('button', {name: 'Actions'});
        fireEvent.click(trigger);
        fireEvent.click(await screen.findByRole('button', {name: 'Custom label'}));

        expect(handler).not.toHaveBeenCalled();
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('resolves links only when the menu opens and activates them with Space', async () => {
        const href = jest.fn(() => '#details');
        const handler = jest.fn();

        render(
            <RowActions
                item="row"
                index={0}
                getRowActions={() => [
                    {
                        text: 'Details',
                        href,
                        target: '_blank',
                        handler: (item, index, event) => {
                            event.preventDefault();
                            handler(item, index, event.currentTarget);
                        },
                    },
                ]}
            />,
        );

        const trigger = screen.getByRole('button', {name: 'Actions'});
        expect(href).not.toHaveBeenCalled();
        fireEvent.click(trigger);

        const action = await screen.findByRole('menuitem', {name: 'Details'});
        expect(href).toHaveBeenCalledWith('row', 0);
        expect(action).toHaveAttribute('href', '#details');
        expect(action).toHaveAttribute('target', '_blank');
        expect(action).toHaveAttribute('rel', 'noopener noreferrer');

        fireEvent.keyDown(action, {key: ' '});

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith('row', 0, action);
    });
});
