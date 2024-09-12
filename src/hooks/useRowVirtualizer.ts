import {useVirtualizer as useTanstackVirtualizer} from '@tanstack/react-virtual';

export type UseRowVirtualizerOptions<TScrollElement extends Element> = Parameters<
    typeof useTanstackVirtualizer<TScrollElement, HTMLTableRowElement>
>[0];

/**
 * @param options
 *
 * @see https://tanstack.com/virtual/latest/docs/api/virtualizer
 * @see https://tanstack.com/virtual/latest/docs/framework/react/react-virtual#usevirtualizer
 *
 * @returns virtualizer instance
 */
export const useRowVirtualizer = <TScrollElement extends Element>(
    options: UseRowVirtualizerOptions<TScrollElement>,
) => {
    return useTanstackVirtualizer<TScrollElement, HTMLTableRowElement>(options);
};
