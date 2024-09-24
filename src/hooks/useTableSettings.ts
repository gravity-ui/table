import React from 'react';

import type {Updater, VisibilityState} from '@tanstack/react-table';

import type {TableSettingsOptions} from '../components';

interface TableSettingsHookProps extends TableSettingsOptions {
    initialOrdering?: string[];
    initialVisibility?: VisibilityState;
    onOrderingChange?: (ordering: Updater<string[]>) => void;
    onVisibilityChange?: (visibility: Updater<VisibilityState>) => void;
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
            if (onVisibilityChange) onVisibilityChange(value);
        },
        [onVisibilityChange],
    );

    const onColumnOrderChange = React.useCallback(
        (value: Updater<string[]>) => {
            setOrderState(value);
            if (onOrderingChange) onOrderingChange(value);
        },
        [onOrderingChange],
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
