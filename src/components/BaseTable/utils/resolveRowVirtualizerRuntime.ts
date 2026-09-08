import type {Virtualizer} from '@tanstack/react-virtual';

import {getRowVirtualizerRuntime} from '../../../hooks/useAdaptiveVirtualizer/utils/getRowVirtualizerRuntime';

export function resolveRowVirtualizerRuntime<TScrollElement extends Element | Window>(
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>,
) {
    return rowVirtualizer ? getRowVirtualizerRuntime(rowVirtualizer) : undefined;
}
