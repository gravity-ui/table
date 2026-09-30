import * as React from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';
import type {VisibilityState} from '@tanstack/react-table';
import {fireEvent, render, screen} from '@testing-library/react';

import {useTable} from '../../hooks/useTable';
import type {ColumnDef} from '../../types/base';

import {TableSettings} from './TableSettings';

const columns: ColumnDef<{first: string; second: string}>[] = [
    {id: 'first', accessorKey: 'first', header: 'First'},
    {id: 'second', accessorKey: 'second', header: 'Second'},
];

const SettingsTest = ({withInitialState = true}: {withInitialState?: boolean}) => {
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({first: false});
    const [columnOrder, setColumnOrder] = React.useState(['second', 'first']);
    const table = useTable({
        columns,
        data: [],
        ...(withInitialState && {
            initialState: {
                columnVisibility: {second: false},
                columnOrder: ['first', 'second'],
            },
        }),
        state: {columnVisibility, columnOrder},
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
    });

    return (
        <React.Fragment>
            <TableSettings table={table} />
            <output data-qa="visibility">{JSON.stringify(columnVisibility)}</output>
            <output data-qa="order">{JSON.stringify(columnOrder)}</output>
        </React.Fragment>
    );
};

describe('TableSettings reset', () => {
    it('restores initial settings only after Apply', () => {
        render(
            <ThemeProvider theme="light">
                <SettingsTest />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getAllByRole('button')[0]);

        fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
        expect(screen.getByTestId('visibility')).toHaveTextContent('{"first":false}');
        expect(screen.getByTestId('order')).toHaveTextContent('["second","first"]');

        fireEvent.click(screen.getByRole('button', {name: 'Apply'}));
        expect(screen.getByTestId('visibility')).toHaveTextContent('{"second":false}');
        expect(screen.getByTestId('order')).toHaveTextContent('["first","second"]');
    });

    it('discards a reset when the popup is closed without applying', () => {
        render(
            <ThemeProvider theme="light">
                <SettingsTest />
            </ThemeProvider>,
        );
        const settingsButton = screen.getAllByRole('button')[0];
        fireEvent.click(settingsButton);
        fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
        fireEvent.click(settingsButton);
        fireEvent.click(settingsButton);
        fireEvent.click(screen.getByRole('button', {name: 'Apply'}));

        expect(screen.getByTestId('visibility')).toHaveTextContent('{"first":false}');
        expect(screen.getByTestId('order')).toHaveTextContent('["second","first"]');
    });

    it('shows all columns in definition order when initial state is omitted', () => {
        render(
            <ThemeProvider theme="light">
                <SettingsTest withInitialState={false} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
        fireEvent.click(screen.getByRole('button', {name: 'Apply'}));

        expect(screen.getByTestId('visibility')).toHaveTextContent('{}');
        expect(screen.getByTestId('order')).toHaveTextContent('["first","second"]');
    });
});
