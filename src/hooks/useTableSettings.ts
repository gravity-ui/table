import React from 'react';

import type {Updater, VisibilityState} from '@tanstack/react-table';

import type {TableSettingsOptions} from '../components';

interface TableSettingsHookProps extends TableSettingsOptions {
    initialOrdering?: string[];
    initialVisibility?: VisibilityState;
    onOrderingChange?: (ordering: string[]) => void;
    onVisibilityChange?: (visibility: VisibilityState) => void;
}

export const useTableSettings: (options?: TableSettingsHookProps) => {
    settingsState: {columnVisibility: VisibilityState; columnOrder: string[]};
    settingsCallbacks: {
        onColumnVisibilityChange: (value: Updater<VisibilityState>) => void;
        onColumnOrderChange: (value: Updater<string[]>) => void;
    };
} = (
    {initialOrdering = [], initialVisibility = {}, onVisibilityChange, onOrderingChange} = {
        initialOrdering: [],
        initialVisibility: {},
    },
) => {
    const [visibilityState, setVisibilityState] =
        React.useState<VisibilityState>(initialVisibility);
    const [orderingState, setOrderState] = React.useState<string[]>(initialOrdering);

    const onColumnVisibilityChange = React.useCallback(
        (value: Updater<VisibilityState>) => {
            setVisibilityState(value);
            if (onVisibilityChange) {
                const newValue = typeof value === 'function' ? value(visibilityState) : value;
                onVisibilityChange(newValue);
            }
        },
        [onVisibilityChange, visibilityState],
    );

    const onColumnOrderChange = React.useCallback(
        (value: Updater<string[]>) => {
            setOrderState(value);
            if (onOrderingChange) {
                const newValue = typeof value === 'function' ? value(orderingState) : value;
                onOrderingChange(newValue);
            }
        },
        [onOrderingChange, orderingState],
    );

    return {
        settingsState: {
            columnVisibility: visibilityState,
            columnOrder: orderingState,
        },
        settingsCallbacks: {
            onColumnVisibilityChange,
            onColumnOrderChange,
        },
    };
};
