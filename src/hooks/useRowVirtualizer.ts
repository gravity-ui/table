import type {Virtualizer} from '@tanstack/react-virtual';
import {useVirtualizer as useTanstackVirtualizer} from '@tanstack/react-virtual';

import {
    useAdaptiveVirtualizerLifecycle,
    useAdaptiveVirtualizerState,
    useCommittedScrollAdjustment,
} from './useAdaptiveVirtualizer';

export type UseRowVirtualizerOptions<TScrollElement extends Element> = Parameters<
    typeof useTanstackVirtualizer<TScrollElement, HTMLTableRowElement>
>[0] & {
    /** Keeps a bounded row window mounted and recovers uncovered ranges synchronously. */
    adaptiveFlushSync?: boolean;
    shouldAdjustScrollPositionOnItemSizeChange?: Virtualizer<
        TScrollElement,
        HTMLTableRowElement
    >['shouldAdjustScrollPositionOnItemSizeChange'];
};

/**
 * Creates an element row virtualizer configured for table row measurement.
 *
 * @param options TanStack Virtual options plus Gravity UI adaptive row virtualization options.
 * @returns The configured TanStack row virtualizer.
 *
 * @see https://tanstack.com/virtual/latest/docs/api/virtualizer
 * @see https://tanstack.com/virtual/latest/docs/framework/react/react-virtual#usevirtualizer
 */
export const useRowVirtualizer = <TScrollElement extends Element>(
    options: UseRowVirtualizerOptions<TScrollElement>,
) => {
    const adaptiveState = useAdaptiveVirtualizerState(options);

    const {
        adaptiveFlushSync,
        rangeExtractor,
        shouldAdjustScrollPositionOnItemSizeChange,
        ...virtualizerOptions
    } = options;
    const virtualizer = useTanstackVirtualizer<TScrollElement, HTMLTableRowElement>({
        ...virtualizerOptions,
        getItemKey: adaptiveFlushSync ? adaptiveState.adaptiveGetItemKey : options.getItemKey,
        onChange: adaptiveState.handleChange,
        rangeExtractor: adaptiveFlushSync ? adaptiveState.adaptiveRangeExtractor : rangeExtractor,
        useFlushSync: adaptiveFlushSync ? false : options.useFlushSync,
    });

    useCommittedScrollAdjustment(virtualizer, shouldAdjustScrollPositionOnItemSizeChange);
    useAdaptiveVirtualizerLifecycle(virtualizer, adaptiveState, options);

    return virtualizer;
};
