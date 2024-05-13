import type {TableProps} from '../Table';

export interface FlattenTableDataParams<TData, TTransformedData>
    extends Pick<TableProps<TData>, 'data' | 'expandedIds' | 'getSubRows' | 'getRowId'> {
    transformItem: (item: TData) => TTransformedData;
}

export function flattenTableData<TData, TTransformedData = TData>({
    data,
    transformItem = (item) => item as unknown as TTransformedData,
    getSubRows,
    expandedIds,
    getRowId,
}: FlattenTableDataParams<TData, TTransformedData>): TTransformedData[] {
    const result: TTransformedData[] = [];

    for (const item of data) {
        result.push(transformItem(item));

        const subItems = getSubRows?.(item);
        if (subItems && expandedIds?.includes(getRowId(item))) {
            result.push(
                ...flattenTableData({
                    data: subItems,
                    getSubRows,
                    expandedIds,
                    transformItem,
                    getRowId,
                }),
            );
        }
    }

    return result;
}
