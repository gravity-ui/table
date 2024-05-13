import React from 'react';

import type {Cell, Row} from '@tanstack/react-table';

import {b} from '../Table/Table.classname';
import {renderDefaultGroupHeader} from '../utils/renderDefaultGroupHeader';

export interface BaseRowProps<TData> {
    cellClassName?: string;
    checkIsGroupRow?: (row: Row<TData>) => boolean;
    children?: React.ReactNode;
    className?: string;
    columnsCount: number;
    getGroupTitle?: (row: Row<TData>) => React.ReactNode;
    getRowDataAttributes?: (
        row: Row<TData>,
    ) => React.DataHTMLAttributes<HTMLTableRowElement> | undefined;
    onClick?: (row: Row<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void;
    renderCell: (cell: Cell<TData, unknown>) => React.ReactNode;
    renderGroupHeader?: (
        row: Row<TData>,
        getGroupTitle?: (row: Row<TData>) => React.ReactNode,
    ) => React.ReactNode;
    row: Row<TData>;
    style?: React.CSSProperties;
}

export const BaseRow = React.forwardRef(
    <TData,>(
        {
            cellClassName,
            checkIsGroupRow,
            children,
            className,
            columnsCount,
            getGroupTitle,
            getRowDataAttributes,
            onClick,
            renderCell,
            renderGroupHeader = renderDefaultGroupHeader,
            row,
            style,
        }: BaseRowProps<TData>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const isGroup = checkIsGroupRow?.(row);

        const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
            onClick?.(row, event);
        };

        return (
            <tr
                ref={ref}
                style={style}
                className={b(
                    'row',
                    {
                        selected: row.getIsSelected(),
                        interactive: Boolean(onClick),
                    },
                    className,
                )}
                onClick={handleClick}
                {...getRowDataAttributes?.(row)}
            >
                {isGroup && (
                    <React.Fragment>
                        {row.getCanSelect() && renderCell(row.getVisibleCells()[0]!)}
                        <td
                            colSpan={columnsCount}
                            className={b('cell', b('group-header-cell', cellClassName))}
                        >
                            {renderGroupHeader(row, getGroupTitle)}
                        </td>
                    </React.Fragment>
                )}
                {!isGroup &&
                    row
                        .getVisibleCells()
                        .map((cell) => (
                            <React.Fragment key={cell.id}>{renderCell(cell)}</React.Fragment>
                        ))}
                {children}
            </tr>
        );
    },
) as (<TData>(
    props: BaseRowProps<TData> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName: string};

BaseRow.displayName = 'BaseRow';
