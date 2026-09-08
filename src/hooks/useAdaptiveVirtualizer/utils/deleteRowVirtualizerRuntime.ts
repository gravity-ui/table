import type {Virtualizer} from '@tanstack/react-virtual';

import {rowVirtualizerRuntimes} from './rowVirtualizerRuntimes';

export const deleteRowVirtualizerRuntime = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
) => {
    rowVirtualizerRuntimes.delete(virtualizer);
};
