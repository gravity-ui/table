import React from 'react';

import type {TableProps} from '../Table';
import {Table} from '../Table';

export const SortingDemo = <ItemType,>(props: TableProps<ItemType>) => {
    const [sorting, setSorting] = React.useState<NonNullable<TableProps<ItemType>['sorting']>>([]);

    return <Table {...props} enableSorting sorting={sorting} onSortingChange={setSorting} />;
};
