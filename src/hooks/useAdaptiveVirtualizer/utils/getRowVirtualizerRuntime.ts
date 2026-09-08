import type {Virtualizer} from '@tanstack/react-virtual';

import type {RowVirtualizerRuntime} from '../types';

import {rowVirtualizerRuntimes} from './rowVirtualizerRuntimes';

export const getRowVirtualizerRuntime = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
) => rowVirtualizerRuntimes.get(virtualizer) as RowVirtualizerRuntime | undefined;
