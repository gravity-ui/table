import React from 'react';

import type {SortingState} from '@tanstack/react-table';

import {useTable} from '../../../../hooks';
import {columns} from '../../../BaseTable/__stories__/constants/columns';
import {data} from '../../../BaseTable/__stories__/constants/data';
import {SortIndicator} from '../../../SortIndicator';
import {Table} from '../../Table';

import {cnSortingStory} from './SortingStory.classname';

import './SortingStory.scss';

export const SortingStory = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useTable({
        columns,
        data,
        enableSorting: true,
        getRowId: (item) => item.id,
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <Table
            table={table}
            className={cnSortingStory()}
            renderSortIndicator={(sortIndicatorProps) => <SortIndicator {...sortIndicatorProps} />}
            sortIndicatorClassName={cnSortingStory('sort-indicator')}
        />
    );
};
