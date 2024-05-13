import React from 'react';

import type {TableProps} from '../Table';
import {Table} from '../Table';

export const WithSelectionDemo = <ItemType,>(props: TableProps<ItemType>) => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    return <Table {...props} selectedIds={selectedIds} onSelectedChange={setSelectedIds} />;
};
