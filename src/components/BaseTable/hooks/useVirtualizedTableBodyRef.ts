import * as React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {Virtualizer} from '@tanstack/react-virtual';

import type {RowVirtualizerRuntime} from '../../../hooks/useAdaptiveVirtualizer/types';
import {getContainerRef} from '../utils/getContainerRef';

interface UseVirtualizedTableBodyRefProps<TScrollElement extends Element | Window> {
    bodyRef?: React.Ref<HTMLTableSectionElement>;
    directDomUpdates: boolean;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    runtime?: RowVirtualizerRuntime;
}

export function useVirtualizedTableBodyRef<TScrollElement extends Element | Window>({
    bodyRef,
    directDomUpdates,
    rowVirtualizer,
    runtime,
}: UseVirtualizedTableBodyRefProps<TScrollElement>) {
    const bodyElementRef = React.useRef<HTMLTableSectionElement>(null);
    const virtualizerRuntime = runtime;
    const setRuntimeBodyElement = React.useCallback(
        (element: HTMLTableSectionElement | null) => {
            if (virtualizerRuntime) {
                virtualizerRuntime.bodyElement = element;
            }
        },
        [virtualizerRuntime],
    );

    return {
        bodyElementRef,
        resolvedBodyRef: useForkRef(
            bodyRef,
            bodyElementRef,
            setRuntimeBodyElement,
            directDomUpdates ? getContainerRef(rowVirtualizer) : undefined,
        ),
    };
}
