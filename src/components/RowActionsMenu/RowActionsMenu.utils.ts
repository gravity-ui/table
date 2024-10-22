import type {TableActionConfig, TableActionGroup} from '../../types/RowActions';

export const isActionGroup = <TValue extends unknown>(
    config: TableActionConfig<TValue>,
): config is TableActionGroup<TValue> => {
    return Array.isArray((config as TableActionGroup<TValue>).items);
};
