import React from 'react';

import {useTable} from '../../../../hooks';
import {BaseTable} from '../../../BaseTable';
import {columns} from '../../constants/columns';

import {cnEmptyContentDemo} from './EmptyContent.classname';

import './EmptyContent.scss';

const emptyContentPlaceholder = <div className={cnEmptyContentDemo('placeholder')}>No data</div>;

export const EmptyContentDemo = () => {
    const table = useTable({
        columns,
        data: [],
    });

    return <BaseTable table={table} emptyContent={emptyContentPlaceholder} />;
};
