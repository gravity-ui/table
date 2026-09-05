import type {Virtualizer} from '@tanstack/react-virtual';

import {useIsomorphicInsertionEffect} from '../../useIsomorphicInsertionEffect';

export const useCommittedScrollAdjustment = <TScrollElement extends Element | Window>(
    virtualizer: Virtualizer<TScrollElement, HTMLTableRowElement>,
    shouldAdjustScrollPositionOnItemSizeChange:
        | Virtualizer<
              TScrollElement,
              HTMLTableRowElement
          >['shouldAdjustScrollPositionOnItemSizeChange']
        | undefined,
) => {
    useIsomorphicInsertionEffect(() => {
        Object.assign(virtualizer, {shouldAdjustScrollPositionOnItemSizeChange});
    }, [shouldAdjustScrollPositionOnItemSizeChange, virtualizer]);
};
