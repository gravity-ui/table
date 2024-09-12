import {useWindowVirtualizer as useTanstackWindowVirtualizer} from '@tanstack/react-virtual';

export type UseWindowRowVirtualizerOptions = Parameters<
    typeof useTanstackWindowVirtualizer<HTMLTableRowElement>
>[0];

/**
 * @param options
 *
 * @see https://tanstack.com/virtual/latest/docs/api/virtualizer
 * @see https://tanstack.com/virtual/latest/docs/framework/react/react-virtual#usewindowvirtualizer
 *
 * @returns window virtualizer instance
 */
export const useWindowRowVirtualizer = (options: UseWindowRowVirtualizerOptions) => {
    return useTanstackWindowVirtualizer<HTMLTableRowElement>(options);
};
