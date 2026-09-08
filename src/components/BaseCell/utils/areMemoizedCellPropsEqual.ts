import type {BaseCellImplementationProps} from '../BaseCell';

export function areMemoizedCellPropsEqual<TData>(
    previousProps: BaseCellImplementationProps<TData>,
    nextProps: BaseCellImplementationProps<TData>,
) {
    if (!previousProps.memoizeContent || !nextProps.memoizeContent) {
        return false;
    }

    const nextKeys = Object.keys(nextProps) as Array<keyof BaseCellImplementationProps<TData>>;
    return (
        Object.keys(previousProps).length === nextKeys.length &&
        nextKeys.every((key) => previousProps[key] === nextProps[key])
    );
}
