import * as React from 'react';

import {Button, Text} from '@gravity-ui/uikit';
import type {ColumnDef, SortingState} from '@tanstack/react-table';

import {SortIndicator, Table} from '../../../components';
import {useTable} from '../../useTable';
import {useColumnsAutoSize} from '../useColumnsAutoSize';

type Row = {
    name: string;
    age: number;
    visits: number;
    status: string;
    progress: number;
    score: number;
};

const data: Row[] = [
    {
        name: 'Alexander Smith-Johnson',
        age: 42,
        visits: 128,
        status: 'In progress',
        progress: 64,
        score: 8754,
    },
    {
        name: 'Olivia Garcia-Williams',
        age: 29,
        visits: 2048,
        status: 'Completed',
        progress: 100,
        score: 12450,
    },
    {
        name: 'Benjamin Rodriguez',
        age: 35,
        visits: 512,
        status: 'Draft',
        progress: 18,
        score: 6230,
    },
];

const baseColumns: ColumnDef<Row>[] = [
    {accessorKey: 'name', header: 'Name'},
    {accessorKey: 'age', header: 'Age'},
];

const additionalColumns: ColumnDef<Row>[] = [
    {accessorKey: 'visits', header: 'Visits with a long header'},
    {accessorKey: 'status', header: 'Current status'},
    {accessorKey: 'progress', header: 'Profile progress'},
    {accessorKey: 'score', header: 'Total score'},
];

export const MeasureOnceColumnsChangeTable = () => {
    const [additionalColumnCount, setAdditionalColumnCount] = React.useState(0);
    const [measurementCount, setMeasurementCount] = React.useState(0);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const measuredWidthsRef = React.useRef<Record<string, number>>({});
    const columns = React.useMemo(
        () => [...baseColumns, ...additionalColumns.slice(0, additionalColumnCount)],
        [additionalColumnCount],
    );
    const {columnWidths, columnsWithAutoSizes, isMeasuring, setTableInstance} = useColumnsAutoSize({
        columns,
        options: {
            measureOnce: true,
            // Cell padding plus enough room for the sort indicator rendered next to the header.
            headerPadding: 48,
        },
    });
    const table = useTable({
        data,
        columns: columnsWithAutoSizes,
        enableSorting: true,
        onSortingChange: setSorting,
        state: {sorting},
    });

    React.useEffect(() => {
        setTableInstance(table);
    }, [setTableInstance, table]);

    React.useEffect(() => {
        if (Object.keys(columnWidths).length > 0 && measuredWidthsRef.current !== columnWidths) {
            measuredWidthsRef.current = columnWidths;
            setMeasurementCount((count) => count + 1);
        }
    }, [columnWidths]);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <Button
                    disabled={additionalColumnCount === additionalColumns.length}
                    onClick={() => setAdditionalColumnCount((count) => count + 1)}
                >
                    Add column
                </Button>
                <Button
                    disabled={additionalColumnCount === 0}
                    onClick={() => setAdditionalColumnCount((count) => count - 1)}
                >
                    Remove column
                </Button>
                <Text variant="body-1">Width recalculations: {measurementCount}</Text>
                <Text variant="body-1">Columns: {columns.length}</Text>
            </div>
            {isMeasuring ? (
                <div />
            ) : (
                <Table
                    table={table}
                    headerCellAttributes={{style: {whiteSpace: 'nowrap'}}}
                    renderSortIndicator={(props) => <SortIndicator {...props} />}
                />
            )}
        </div>
    );
};
