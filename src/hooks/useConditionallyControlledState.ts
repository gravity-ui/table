import * as React from 'react';

// Local implementation to keep the basic table independent of UIKit hooks.
export function useConditionallyControlledState<T>(
    value: T | undefined,
    onChange: ((value: T) => void) | undefined,
    initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [internalValue, setInternalValue] = React.useState(value ?? initialValue);
    const isControlled = value !== undefined && onChange !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const latest = React.useRef({value: currentValue, onChange, isControlled});
    latest.current = {value: currentValue, onChange, isControlled};

    const setValue = React.useCallback((update: React.SetStateAction<T>) => {
        const current = latest.current;
        const next =
            typeof update === 'function' ? (update as (previous: T) => T)(current.value) : update;
        if (Object.is(next, current.value)) return;
        if (!current.isControlled) {
            latest.current.value = next;
            setInternalValue(next);
        }
        current.onChange?.(next);
    }, []);

    return [currentValue, setValue];
}
