import * as React from 'react';

import {flexRender} from '@tanstack/react-table';
import type {Table} from '@tanstack/react-table';

import {getCellClassModes, getCellStyles, getHeaderCellClassModes} from '../../utils';
import {b as cnTable} from '../BaseTable/BaseTable.classname';
import type {
    ColumnReorderingProviderProps,
    OverlayClassNames,
} from '../ColumnReorderingProvider/types';

import {b} from './ColumnDragOverlay.classname';
import {overlayCellStyles} from './utils/overlayCellStyles';

import './ColumnDragOverlay.scss';

export interface ColumnDragOverlayProps<TData> {
    table: Table<TData>;
    /** Id of the column currently being dragged, or `null` when nothing is dragged */
    activeColumnId: string | null;
    /** Class names captured from the real table DOM, used to mirror its look in the overlay */
    overlayClassNames: OverlayClassNames | null;
    /** Number of leading rows rendered below the header in the preview */
    dragOverlayRowCount?: number;
    /** Custom overlay renderer; when provided it fully replaces the default preview */
    renderDragOverlay?: ColumnReorderingProviderProps<TData>['renderDragOverlay'];
}

function ColumnDragOverlayInternal<TData>({
    table,
    activeColumnId,
    overlayClassNames,
    dragOverlayRowCount,
    renderDragOverlay,
}: ColumnDragOverlayProps<TData>) {
    if (!activeColumnId) {
        return null;
    }

    if (renderDragOverlay) {
        return <React.Fragment>{renderDragOverlay({columnId: activeColumnId})}</React.Fragment>;
    }

    const activeHeader = table
        .getFlatHeaders()
        .find((header) => header.column.id === activeColumnId);

    if (!activeHeader) {
        return null;
    }

    const allRows = table.getRowModel().rows;
    const previewRows =
        typeof dragOverlayRowCount === 'number'
            ? allRows.slice(0, Math.max(0, dragOverlayRowCount))
            : allRows;

    const cn = overlayClassNames ?? {};

    return (
        <table className={b(null, cn.table)}>
            <thead className={cn.thead ?? cnTable('header')}>
                <tr className={cn.headerRow ?? cnTable('header-row')}>
                    <th
                        className={
                            cn.headerCell ??
                            cnTable('header-cell', getHeaderCellClassModes(activeHeader))
                        }
                        style={overlayCellStyles(getCellStyles(activeHeader))}
                    >
                        {flexRender(
                            activeHeader.column.columnDef.header,
                            activeHeader.getContext(),
                        )}
                    </th>
                </tr>
            </thead>
            <tbody className={cn.tbody ?? cnTable('body')}>
                {previewRows.map((row) => {
                    const cell = row
                        .getVisibleCells()
                        .find((item) => item.column.id === activeColumnId);

                    if (!cell) {
                        return null;
                    }

                    return (
                        <tr className={cn.row ?? cnTable('row')} key={row.id}>
                            <td
                                className={cn.cell ?? cnTable('cell', getCellClassModes(cell))}
                                style={overlayCellStyles(getCellStyles(cell))}
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export const ColumnDragOverlay = React.memo(
    ColumnDragOverlayInternal,
) as typeof ColumnDragOverlayInternal;
