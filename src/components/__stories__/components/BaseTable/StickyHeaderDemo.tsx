import React from 'react';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../../BaseTable';
import {columns} from '../../constants/columns';
import {generateData} from '../../utils';

import {cnStickyHeaderDemo} from './StickyHeaderDemo.classname';

import './StickyHeaderDemo.scss';

const data = generateData(30);

export const StickyHeaderDemo = () => {
    const table = useTable({
        columns,
        data,
    });

    return (
        <div className={cnStickyHeaderDemo()}>
            <BaseTable className={cnStickyHeaderDemo('table')} table={table} stickyHeader />
        </div>
    );
};
