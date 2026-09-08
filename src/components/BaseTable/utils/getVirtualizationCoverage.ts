import type {Virtualizer} from '@tanstack/react-virtual';

import type {RenderedRowRecord} from '../../../hooks/useAdaptiveVirtualizer/types';
import {getRowVirtualizerCoverage} from '../../../hooks/useAdaptiveVirtualizer/utils/getRowVirtualizerCoverage';

export function getVirtualizationCoverage<TScrollElement extends Element | Window>(
    rowVirtualizer: Virtualizer<TScrollElement, HTMLTableRowElement> | undefined,
    renderedRows: RenderedRowRecord[] | null,
) {
    return rowVirtualizer ? getRowVirtualizerCoverage(rowVirtualizer, renderedRows) : undefined;
}
