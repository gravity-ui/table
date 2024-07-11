import {useWindowVirtualizer as useTanstackWindowVirtualizer} from '@tanstack/react-virtual';

export type UseWindowRowVirtualizerOptions = Parameters<
    typeof useTanstackWindowVirtualizer<HTMLTableRowElement>
>[0];

export const useWindowRowVirtualizer = (options: UseWindowRowVirtualizerOptions) => {
    return useTanstackWindowVirtualizer<HTMLTableRowElement>(options);
};
