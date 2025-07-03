import * as React from 'react';

import type {ExpandedState} from '@tanstack/react-table';

import {BaseTable} from '../../../components';
import type {UseTableOptions} from '../../../types/base';
import {useTable} from '../../useTable';
import type {UseColumnsAutoSizeOptions} from '../types';
import {useColumnsAutoSize} from '../useColumnsAutoSize';

import type {Person} from './types';

export type AutoSizedTableProps = UseColumnsAutoSizeOptions &
    Pick<
        UseTableOptions<Person>,
        'getSubRows' | 'enableColumnResizing' | 'enableExpanding' | 'columns' | 'data'
    >;

export const AutoSizedTable = ({
    data,
    columns,
    enableColumnResizing = false,
    sampleSize = 100,
    respectExistingWidths = true,
    respectResizedWidths = true,
    minWidth = 50,
    maxWidth = 500,
    padding = 24,
    headerPadding = 24,
    measureHeaderText = true,
    enableExpanding = false,
    getSubRows,
}: AutoSizedTableProps) => {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const {setTableInstance, isMeasuring, columnsWithAutoSizes} = useColumnsAutoSize({
        columns,
        options: {
            minWidth,
            maxWidth,
            sampleSize,
            padding,
            headerPadding,
            measureHeaderText,
            respectExistingWidths,
            respectResizedWidths,
        },
    });

    const table = useTable({
        data,
        columns: columnsWithAutoSizes,
        enableColumnResizing,
        columnResizeMode: 'onChange',
        getSubRows,
        enableExpanding,
        onExpandedChange: setExpanded,
        state: {
            expanded,
        },
    });

    React.useEffect(() => {
        setTableInstance(table);
    }, [table, setTableInstance]);

    if (isMeasuring) {
        return null;
    }

    return <BaseTable table={table} />;
};
