import type {ColumnDef} from '../../types';

export function getWithDepthIndicatorsMod<TData>(columnDef: ColumnDef<TData>) {
    const showTreeDepthIndicators = columnDef.showTreeDepthIndicators ?? true;

    return {
        'with-depth-indicators': showTreeDepthIndicators && columnDef.isTreeNode,
    };
}
