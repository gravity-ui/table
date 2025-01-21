import {useTable} from '../../../../hooks';
import {columns} from '../../../BaseTable/__stories__/constants/columns';
import {generateData} from '../../../BaseTable/__stories__/utils';
import {Table} from '../../index';

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
            <Table className={cnStickyHeaderStory('table')} table={table} stickyHeader />
        </div>
    );
};
