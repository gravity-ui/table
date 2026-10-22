import * as React from 'react';

import type {Virtualizer} from '@tanstack/react-virtual';

import {useIsomorphicLayoutEffect} from '../../useIsomorphicLayoutEffect';
import type {AdaptiveVirtualizerState, UseAdaptiveVirtualizerProps} from '../types';
import {clearRowVirtualizerDom} from '../utils/clearRowVirtualizerDom';
import {deleteRowVirtualizerRuntime} from '../utils/deleteRowVirtualizerRuntime';
import {scheduleMicrotask} from '../utils/scheduleMicrotask';
import {setRowVirtualizerRuntime} from '../utils/setRowVirtualizerRuntime';
import {syncRowVirtualizerDom} from '../utils/syncRowVirtualizerDom';

export const useAdaptiveVirtualizerLifecycle = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    state: AdaptiveVirtualizerState<TScrollElement>,
    options: UseAdaptiveVirtualizerProps<TScrollElement>,
) => {
    const {controller, runtime} = state;
    const adaptive = Boolean(options.adaptiveFlushSync);
    const lifecycleGenerationRef = React.useRef(0);
    const registeredVirtualizerRef = React.useRef<typeof virtualizer | null>(null);

    useIsomorphicLayoutEffect(() => {
        const registeredVirtualizer = registeredVirtualizerRef.current;
        const isFirstRegistration = registeredVirtualizer !== virtualizer;
        const previousController = runtime.controller;
        const previousDirectDomUpdates = runtime.directDomUpdates;
        const previousDirectDomUpdatesMode = runtime.directDomUpdatesMode;
        const nextController = adaptive ? controller : null;
        const nextDirectDomUpdates = Boolean(options.directDomUpdates);
        const nextDirectDomUpdatesMode = options.directDomUpdatesMode ?? 'transform';

        if (registeredVirtualizer && isFirstRegistration) {
            clearRowVirtualizerDom(registeredVirtualizer, runtime);
            deleteRowVirtualizerRuntime(registeredVirtualizer);
        }
        runtime.controller = nextController;
        runtime.directDomUpdates = nextDirectDomUpdates;
        runtime.directDomUpdatesMode = nextDirectDomUpdatesMode;
        setRowVirtualizerRuntime(virtualizer, runtime);
        registeredVirtualizerRef.current = virtualizer;
        controller.commitConfiguration(state.configuration);

        if (
            (isFirstRegistration && (adaptive || nextDirectDomUpdates)) ||
            previousController !== nextController ||
            previousDirectDomUpdates !== nextDirectDomUpdates ||
            previousDirectDomUpdatesMode !== nextDirectDomUpdatesMode
        ) {
            state.notifyAdaptiveRangeChange(false);
        }
    }, [
        adaptive,
        controller,
        options.directDomUpdates,
        options.directDomUpdatesMode,
        runtime,
        state.configuration,
        state.notifyAdaptiveRangeChange,
        virtualizer,
    ]);

    useIsomorphicLayoutEffect(() => {
        syncRowVirtualizerDom(virtualizer, runtime);
    });

    React.useEffect(() => {
        const scrollElement = virtualizer.scrollElement;
        if (!adaptive || !scrollElement || !('onscrollend' in scrollElement)) {
            return undefined;
        }

        scrollElement.addEventListener('scrollend', controller.markScrollSettled, {passive: true});
        return () => scrollElement.removeEventListener('scrollend', controller.markScrollSettled);
    }, [adaptive, controller, virtualizer, virtualizer.scrollElement]);

    React.useEffect(() => {
        lifecycleGenerationRef.current += 1;
        // React StrictMode replays effect setup/cleanup without another render.
        // Restore the external runtime registration during every setup pass.
        controller.setNotify(state.notifyAdaptiveRangeChange);
        controller.setVirtualizer(virtualizer);
        setRowVirtualizerRuntime(virtualizer, runtime);

        return () => {
            const cleanupGeneration = ++lifecycleGenerationRef.current;
            scheduleMicrotask(() => {
                if (lifecycleGenerationRef.current !== cleanupGeneration) {
                    return;
                }
                clearRowVirtualizerDom(virtualizer, runtime);
                deleteRowVirtualizerRuntime(virtualizer);
                controller.dispose();
            });
        };
    }, [controller, runtime, state.notifyAdaptiveRangeChange, virtualizer]);
};
