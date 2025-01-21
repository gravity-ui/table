import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {columns} from '../constants/columns';
import {generateData} from '../utils';

import {cnStickyHeaderStory} from './StickyHeaderStory.classname';

import './StickyHeaderStory.scss';

const data = generateData(30);

export const StickyHeaderStory = () => {
    const table = useTable({
        columns,
        data,
    });

    return (
        <div className={cnStickyHeaderStory()}>
            <BaseTable className={cnStickyHeaderStory('table')} table={table} stickyHeader />
        </div>
    );
};
