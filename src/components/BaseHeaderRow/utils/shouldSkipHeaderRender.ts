import {areShallowEqual} from '../../../utils/areShallowEqual';
import type {BaseHeaderRowProps} from '../BaseHeaderRow';

export const shouldSkipHeaderRender = <TData, TValue>(
    previousProps: BaseHeaderRowProps<TData, TValue>,
    nextProps: BaseHeaderRowProps<TData, TValue>,
) => {
    // Stable header references do not reflect table state changes without a render version.
    if (
        previousProps.tableRenderVersion === undefined ||
        nextProps.tableRenderVersion === undefined
    ) {
        return false;
    }

    const nextKeys = Object.keys(nextProps) as (keyof BaseHeaderRowProps<TData, TValue>)[];

    return (
        Object.keys(previousProps).length === nextKeys.length &&
        nextKeys.every((key) =>
            key === 'tableRenderVersion'
                ? areShallowEqual(previousProps.tableRenderVersion, nextProps.tableRenderVersion)
                : previousProps[key] === nextProps[key],
        )
    );
};
