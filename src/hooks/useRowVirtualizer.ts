import {useVirtualizer as useTanstackVirtualizer} from '@tanstack/react-virtual';

export type UseRowVirtualizerOptions<TScrollElement extends Element> = Parameters<
    typeof useTanstackVirtualizer<TScrollElement, HTMLTableRowElement>
>[0];

export const useRowVirtualizer = <TScrollElement extends Element>(
    options: UseRowVirtualizerOptions<TScrollElement>,
) => {
    return useTanstackVirtualizer<TScrollElement, HTMLTableRowElement>(options);
};
