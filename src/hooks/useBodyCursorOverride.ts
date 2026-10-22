import * as React from 'react';

interface CursorOverride {
    appliedPriority: string;
    appliedValue: string;
    previousPriority: string;
    previousValue: string;
}

export function useBodyCursorOverride() {
    const overrideRef = React.useRef<CursorOverride | null>(null);

    const setBodyCursor = React.useCallback((value: string) => {
        const {style} = document.body;
        const currentOverride = overrideRef.current;

        overrideRef.current = {
            appliedPriority: '',
            appliedValue: value,
            previousPriority:
                currentOverride?.previousPriority ?? style.getPropertyPriority('cursor'),
            previousValue: currentOverride?.previousValue ?? style.getPropertyValue('cursor'),
        };
        style.setProperty('cursor', value);
    }, []);

    const restoreBodyCursor = React.useCallback(() => {
        const override = overrideRef.current;
        if (!override) {
            return;
        }

        overrideRef.current = null;
        const {style} = document.body;
        if (
            style.getPropertyValue('cursor') !== override.appliedValue ||
            style.getPropertyPriority('cursor') !== override.appliedPriority
        ) {
            return;
        }

        if (override.previousValue) {
            style.setProperty('cursor', override.previousValue, override.previousPriority);
        } else {
            style.removeProperty('cursor');
        }
    }, []);

    React.useEffect(() => restoreBodyCursor, [restoreBodyCursor]);

    return {restoreBodyCursor, setBodyCursor};
}
