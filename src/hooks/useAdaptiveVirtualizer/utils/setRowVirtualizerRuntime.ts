import type {Virtualizer} from '@tanstack/react-virtual';

import type {RowVirtualizerRuntime} from '../types';

import {rowVirtualizerRuntimes} from './rowVirtualizerRuntimes';

export const setRowVirtualizerRuntime = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    runtime: RowVirtualizerRuntime,
) => {
    rowVirtualizerRuntimes.set(virtualizer, runtime);
};
