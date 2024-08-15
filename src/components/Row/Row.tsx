import React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {Row as RowType} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import {Cell} from '../Cell';
import type {CellProps} from '../Cell';
import type {GroupHeaderProps} from '../GroupHeader';
import {GroupHeader} from '../GroupHeader';
import {b} from '../Table/Table.classname';

export interface RowProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends Omit<React.TdHTMLAttributes<HTMLTableRowElement>, 'className' | 'onClick'> {
    cellClassName?: CellProps<TData>['className'];
    className?: string | ((row: RowType<TData>) => string);
    getGroupTitle?: (row: RowType<TData>) => React.ReactNode;
    getIsCustomRow?: (row: RowType<TData>) => boolean;
    getIsGroupHeaderRow?: (row: RowType<TData>) => boolean;
    groupHeaderClassName?: string;
    onClick?: (row: RowType<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void;
    renderCustomRowContent?: (props: {
        Cell: typeof Cell<TData>;
        cellClassName?: CellProps<TData>['className'];
        row: RowType<TData>;
    }) => React.ReactNode;
    renderGroupHeader?: (props: GroupHeaderProps<TData>) => React.ReactNode;
    renderGroupHeaderRowContent?: (props: {
        Cell: typeof Cell<TData>;
        cellClassName?: CellProps<TData>['className'];
        getGroupTitle?: (row: RowType<TData>) => React.ReactNode;
        row: RowType<TData>;
    }) => React.ReactNode;
    row: RowType<TData>;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    style?: React.CSSProperties;
    virtualItem?: VirtualItem<HTMLTableRowElement>;
    attributes?:
        | React.HTMLAttributes<HTMLTableRowElement>
        | ((row: RowType<TData>) => React.HTMLAttributes<HTMLTableRowElement>);
    cellAttributes?: CellProps<TData>['attributes'];
}

export const Row = React.forwardRef(
    <TData, TScrollElement extends Element | Window = HTMLDivElement>(
        {
            cellClassName,
            className: classNameProp,
            getGroupTitle,
            getIsCustomRow,
            getIsGroupHeaderRow,
            groupHeaderClassName,
            onClick,
            renderCustomRowContent,
            renderGroupHeader,
            renderGroupHeaderRowContent,
            row,
            rowVirtualizer,
            style,
            virtualItem,
            attributes: attributesProp,
            cellAttributes,
            ...restProps
        }: RowProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const rowRef = useForkRef(rowVirtualizer?.measureElement, ref);

        const className = React.useMemo(() => {
            return typeof classNameProp === 'function' ? classNameProp(row) : classNameProp;
        }, [classNameProp, row]);

        const handleClick = React.useCallback(
            (event: React.MouseEvent<HTMLTableRowElement>) => {
                onClick?.(row, event);
            },
            [onClick, row],
        );

        const renderRowContent = () => {
            if (getIsGroupHeaderRow?.(row)) {
                return renderGroupHeaderRowContent ? (
                    renderGroupHeaderRowContent({
                        Cell,
                        cellClassName,
                        getGroupTitle,
                        row,
                    })
                ) : (
                    <Cell
                        className={cellClassName}
                        colSpan={row.getVisibleCells().length}
                        attributes={cellAttributes}
                        aria-colindex={1}
                    >
                        {renderGroupHeader ? (
                            renderGroupHeader({
                                className: b('group-header', groupHeaderClassName),
                                getGroupTitle,
                                row,
                            })
                        ) : (
                            <GroupHeader
                                className={b('group-header', groupHeaderClassName)}
                                getGroupTitle={getGroupTitle}
                                row={row}
                            />
                        )}
                    </Cell>
                );
            }

            if (getIsCustomRow?.(row) && renderCustomRowContent) {
                return renderCustomRowContent({Cell, cellClassName, row});
            }

            return row
                .getVisibleCells()
                .map((cell) => (
                    <Cell
                        key={cell.id}
                        cell={cell}
                        className={cellClassName}
                        attributes={cellAttributes}
                        aria-colindex={cell.column.getIndex() + 1}
                    />
                ));
        };

        const attributes =
            typeof attributesProp === 'function' ? attributesProp(row) : attributesProp;

        return (
            <tr
                ref={rowRef}
                style={{
                    top: virtualItem?.start,
                    ...style,
                }}
                className={b(
                    'row',
                    {
                        selected: row.getIsSelected(),
                        interactive: Boolean(onClick),
                    },
                    className,
                )}
                onClick={handleClick}
                data-index={virtualItem?.index}
                {...restProps}
                {...attributes}
            >
                {renderRowContent()}
            </tr>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: RowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName: string};

Row.displayName = 'Row';
