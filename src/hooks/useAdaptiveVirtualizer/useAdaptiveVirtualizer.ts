import * as React from 'react';

import type {Range, Virtualizer} from '@tanstack/react-virtual';
import {flushSync} from 'react-dom';

import {useIsomorphicLayoutEffect} from '../useIsomorphicLayoutEffect';

import type {
    AdaptiveVirtualizerState,
    RowVirtualizerRuntime,
    UseAdaptiveVirtualizerProps,
} from './types';
import {createAdaptiveVirtualizerController} from './utils/createAdaptiveVirtualizerController';
import {createVersionedCallback} from './utils/createVersionedCallback';
import {syncRowVirtualizerDom} from './utils/syncRowVirtualizerDom';

export const useAdaptiveVirtualizerState = <TScrollElement extends Element | Window>(
    options: UseAdaptiveVirtualizerProps<TScrollElement>,
): AdaptiveVirtualizerState<TScrollElement> => {
    const [rangeExtractorVersion, notifyRangeChange] = React.useReducer(
        (version: number) => version + 1,
        0,
    );
    const [controller] = React.useState(createAdaptiveVirtualizerController);
    const runtimeRef = React.useRef<RowVirtualizerRuntime>({
        bodyElement: null,
        controller: options.adaptiveFlushSync ? controller : null,
        directDomUpdates: Boolean(options.directDomUpdates),
        directDomUpdatesAppliedMode: null,
        directDomUpdatesMode: options.directDomUpdatesMode ?? 'transform',
        placeholderElements: new Map(),
        renderedRows: null,
    });
    const optionsRef = React.useRef(options);

    useIsomorphicLayoutEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const configuration = React.useMemo(
        () =>
            controller.configure({
                adaptive: Boolean(options.adaptiveFlushSync),
                count: options.count,
                enabled: options.enabled ?? true,
                getItemKey: options.getItemKey,
                lanes: options.lanes ?? 1,
                overscan: options.overscan ?? 1,
                rangeExtractor: options.rangeExtractor,
            }),
        [
            controller,
            options.adaptiveFlushSync,
            options.count,
            options.enabled,
            options.getItemKey,
            options.lanes,
            options.overscan,
            options.rangeExtractor,
        ],
    );

    const measurementGeneration = controller.getMeasurementGeneration();

    const adaptiveGetItemKey = React.useMemo(
        () =>
            createVersionedCallback(
                (index: number) => configuration.getItemKey?.(index) ?? index,
                measurementGeneration,
            ),
        [configuration, measurementGeneration],
    );

    const adaptiveRangeExtractor = React.useMemo(
        () =>
            createVersionedCallback(
                (range: Range) => controller.extract(range, configuration),
                rangeExtractorVersion,
            ),
        [configuration, controller, rangeExtractorVersion],
    );

    const notifyAdaptiveRangeChange = React.useCallback(
        (sync = false) => {
            if (sync) {
                flushSync(notifyRangeChange);
            } else {
                notifyRangeChange();
            }
        },
        [notifyRangeChange],
    );

    controller.setNotify(notifyAdaptiveRangeChange);

    const handleChange = React.useCallback(
        (instance: Virtualizer<TScrollElement, HTMLTableRowElement>, sync: boolean) => {
            const currentOptions = optionsRef.current;

            if (currentOptions.adaptiveFlushSync) {
                // Force the public range extractor for the newly calculated core
                // range before deciding whether this change needs a hard render.
                instance.getVirtualItems();
                controller.prepareForChange();
            }

            syncRowVirtualizerDom(instance, runtimeRef.current);

            if (currentOptions.adaptiveFlushSync) {
                if (controller.takeHardGeneration()) {
                    notifyAdaptiveRangeChange(sync);
                }
                if (!instance.isScrolling) {
                    controller.markScrollStopped();
                }
            }
            currentOptions.onChange?.(instance, sync);
        },
        [controller, notifyAdaptiveRangeChange],
    );

    return {
        adaptiveGetItemKey,
        adaptiveRangeExtractor,
        configuration,
        controller,
        handleChange,
        notifyAdaptiveRangeChange,
        runtime: runtimeRef.current,
    };
};
