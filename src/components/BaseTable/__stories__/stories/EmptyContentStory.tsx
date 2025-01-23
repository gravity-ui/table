import {useTable} from '../../../../hooks';
import {BaseTable} from '../../BaseTable';
import {columns} from '../constants/columns';

import {cnEmptyContentStory} from './EmptyContentStory.classname';

import './EmptyContentStory.scss';

const emptyContentPlaceholder = <div className={cnEmptyContentStory('placeholder')}>No data</div>;

export const EmptyContentStory = () => {
    const table = useTable({
        columns,
        data: [],
    });

    return <BaseTable table={table} emptyContent={emptyContentPlaceholder} />;
};
