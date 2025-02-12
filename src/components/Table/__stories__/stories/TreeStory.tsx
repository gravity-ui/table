import * as React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {columns, data} from '../../../BaseTable/__stories__/constants/tree';
import {Table} from '../../Table';
import type {TableProps} from '../../Table';

export const TreeStory = (props: TableProps<(typeof data)[number]>) => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useTable({
        columns,
        data,
        getSubRows: (item) => item.children,
        enableExpanding: true,
        onExpandedChange: setExpanded,
        state: {
            expanded,
        },
    });

    return <Table {...props} table={table} />;
};
