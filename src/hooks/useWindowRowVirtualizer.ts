import type {Virtualizer} from '@tanstack/react-virtual';
import {useWindowVirtualizer as useTanstackWindowVirtualizer} from '@tanstack/react-virtual';

import {
    useAdaptiveVirtualizerLifecycle,
    useAdaptiveVirtualizerState,
    useCommittedScrollAdjustment,
} from './useAdaptiveVirtualizer';

export type UseWindowRowVirtualizerOptions = Parameters<
    typeof useTanstackWindowVirtualizer<HTMLTableRowElement>
>[0] & {
    /** Keeps a bounded row window mounted and recovers uncovered ranges synchronously. */
    adaptiveFlushSync?: boolean;
    shouldAdjustScrollPositionOnItemSizeChange?: Virtualizer<
        Window,
        HTMLTableRowElement
    >['shouldAdjustScrollPositionOnItemSizeChange'];
};

/**
 * Creates a window row virtualizer configured for table row measurement.
 *
 * @param options TanStack Virtual options plus Gravity UI adaptive row virtualization options.
 * @returns The configured TanStack window row virtualizer.
 *
 * @see https://tanstack.com/virtual/latest/docs/api/virtualizer
 * @see https://tanstack.com/virtual/latest/docs/framework/react/react-virtual#usewindowvirtualizer
 */
export const useWindowRowVirtualizer = (options: UseWindowRowVirtualizerOptions) => {
    const adaptiveState = useAdaptiveVirtualizerState(options);

    const {
        adaptiveFlushSync,
        rangeExtractor,
        shouldAdjustScrollPositionOnItemSizeChange,
        ...virtualizerOptions
    } = options;
    const virtualizer = useTanstackWindowVirtualizer<HTMLTableRowElement>({
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
