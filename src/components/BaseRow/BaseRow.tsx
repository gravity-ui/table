import React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {Row, Table} from '@tanstack/react-table';
import type {VirtualItem, Virtualizer} from '@tanstack/react-virtual';

import type {BaseCellProps} from '../BaseCell';
import {BaseCell} from '../BaseCell';
import type {BaseGroupHeaderProps} from '../BaseGroupHeader';
import {BaseGroupHeader} from '../BaseGroupHeader';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseRowProps<TData, TScrollElement extends Element | Window = HTMLDivElement>
    extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'className' | 'onClick'> {
    cellClassName?: BaseCellProps<TData>['className'];
    className?: string | ((row?: Row<TData>) => string);
    getGroupTitle?: (row: Row<TData>) => React.ReactNode;
    getIsCustomRow?: (row: Row<TData>) => boolean;
    getIsGroupHeaderRow?: (row: Row<TData>) => boolean;
    groupHeaderClassName?: string;
    onClick?: (row: Row<TData>, event: React.MouseEvent<HTMLTableRowElement>) => void;
    renderCustomRowContent?: (props: {
        row: Row<TData>;
        Cell: React.FunctionComponent<BaseCellProps<TData>>;
        cellClassName?: BaseCellProps<TData>['className'];
    }) => React.ReactNode;
    renderGroupHeader?: (props: BaseGroupHeaderProps<TData>) => React.ReactNode;
    renderGroupHeaderRowContent?: (props: {
        row: Row<TData>;
        Cell: React.FunctionComponent<BaseCellProps<TData>>;
        cellClassName?: BaseCellProps<TData>['className'];
        getGroupTitle?: (row: Row<TData>) => React.ReactNode;
    }) => React.ReactNode;
    row: Row<TData>;
    rowVirtualizer?: Virtualizer<TScrollElement, HTMLTableRowElement>;
    style?: React.CSSProperties;
    table: Table<TData>;
    virtualItem?: VirtualItem;
    attributes?:
        | React.HTMLAttributes<HTMLTableRowElement>
        | ((row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>);
    cellAttributes?: BaseCellProps<TData>['attributes'];
}

export const BaseRow = React.forwardRef(
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
            table: _,
            ...restProps
        }: BaseRowProps<TData, TScrollElement>,
        ref: React.Ref<HTMLTableRowElement>,
    ) => {
        const rowRef = useForkRef(rowVirtualizer?.measureElement, ref);

        const attributes =
            typeof attributesProp === 'function' ? attributesProp(row) : attributesProp;

        const className = typeof classNameProp === 'function' ? classNameProp(row) : classNameProp;

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
                        row,
                        Cell: BaseCell,
                        cellClassName,
                        getGroupTitle,
                    })
                ) : (
                    <BaseCell
                        className={cellClassName}
                        colSpan={row.getVisibleCells().length}
                        attributes={cellAttributes}
                        aria-colindex={1}
                    >
                        {renderGroupHeader ? (
                            renderGroupHeader({
                                row,
                                className: b('group-header', groupHeaderClassName),
                                getGroupTitle,
                            })
                        ) : (
                            <BaseGroupHeader
                                row={row}
                                className={b('group-header', groupHeaderClassName)}
                                getGroupTitle={getGroupTitle}
                            />
                        )}
                    </BaseCell>
                );
            }

            if (getIsCustomRow?.(row) && renderCustomRowContent) {
                return renderCustomRowContent({row, Cell: BaseCell, cellClassName});
            }

            return row
                .getVisibleCells()
                .map((cell) => (
                    <BaseCell
                        key={cell.id}
                        cell={cell}
                        className={cellClassName}
                        attributes={cellAttributes}
                        aria-colindex={cell.column.getIndex() + 1}
                    />
                ));
        };

        return (
            <tr
                ref={rowRef}
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
                style={{
                    top:
                        rowVirtualizer && virtualItem
                            ? virtualItem.start - rowVirtualizer.options.scrollMargin
                            : undefined,
                    ...style,
                    ...attributes?.style,
                }}
            >
                {renderRowContent()}
            </tr>
        );
    },
) as (<TData, TScrollElement extends Element | Window = HTMLDivElement>(
    props: BaseRowProps<TData, TScrollElement> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {displayName: string};

BaseRow.displayName = 'BaseRow';
