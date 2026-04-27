import * as React from 'react';

const MIGRATION_DOC = 'docs/MIGRATION-experimentalMemoization.md';

/**
 * @internal
 * Dev-only. Warns once per (component instance, name) when `value` changes
 * identity between renders while `enabled` is true. Used by `BaseTable` to
 * surface props that defeat row memoization.
 *
 * Always silent in production builds and when `enabled` is false.
 */
export function useStableRefWarning(name: string, value: unknown, enabled: boolean): void {
    const prevRef = React.useRef<{value: unknown; warned: boolean} | null>(null);

    if (process.env.NODE_ENV === 'production' || !enabled) {
        return;
    }

    if (prevRef.current === null) {
        prevRef.current = {value, warned: false};
        return;
    }

    if (prevRef.current.warned) {
        prevRef.current.value = value;
        return;
    }

    if (prevRef.current.value !== value) {
        // eslint-disable-next-line no-console
        console.warn(
            `[gravity-ui/table] experimentalMemoization is enabled but \`${name}\` ` +
                `changes reference between renders, which defeats row memoization. ` +
                `Wrap it in useCallback / useMemo or lift it out of the render path. ` +
                `See: ${MIGRATION_DOC}`,
        );
        prevRef.current.warned = true;
    }

    prevRef.current.value = value;
}
