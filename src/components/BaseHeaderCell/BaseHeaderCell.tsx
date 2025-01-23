import * as React from 'react';

import type {Header} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';

import {
    getAriaSort,
    getCellStyles,
    getHeaderCellAriaColIndex,
    getHeaderCellClassModes,
} from '../../utils';
import type {BaseResizeHandleProps} from '../BaseResizeHandle';
import {BaseResizeHandle} from '../BaseResizeHandle';
import {BaseSort} from '../BaseSort';
import type {BaseSortIndicatorProps} from '../BaseSortIndicator';
import {BaseSortIndicator} from '../BaseSortIndicator';
import {b} from '../BaseTable/BaseTable.classname';

export interface BaseHeaderCellProps<TData, TValue> {
    className?:
        | string
        | ((header: Header<TData, TValue>, parentHeader?: Header<TData, unknown>) => string);
    header: Header<TData, TValue>;
    parentHeader?: Header<TData, unknown>;
    renderHeaderCellContent?: (props: {header: Header<TData, TValue>}) => React.ReactNode;
    renderResizeHandle?: (props: BaseResizeHandleProps<TData, TValue>) => React.ReactNode;
    renderSortIndicator?: (props: BaseSortIndicatorProps<TData, TValue>) => React.ReactNode;
    resizeHandleClassName?: string;
    sortIndicatorClassName?: string;
    attributes?:
        | React.ThHTMLAttributes<HTMLTableCellElement>
        | ((
              header: Header<TData, TValue>,
              parentHeader?: Header<TData, unknown>,
          ) => React.ThHTMLAttributes<HTMLTableCellElement>);
}

export const BaseHeaderCell = <TData, TValue>({
    className: classNameProp,
    header,
    parentHeader,
    renderHeaderCellContent,
    renderResizeHandle,
    renderSortIndicator,
    resizeHandleClassName,
    sortIndicatorClassName,
    attributes: attributesProp,
}: BaseHeaderCellProps<TData, TValue>) => {
    const attributes =
        typeof attributesProp === 'function'
            ? attributesProp(header, parentHeader)
            : attributesProp;

    const className =
        typeof classNameProp === 'function' ? classNameProp(header, parentHeader) : classNameProp;

    const rowSpan = header.isPlaceholder ? header.getLeafHeaders().length : 1;

    const renderContent = () => {
        if (renderHeaderCellContent) {
            return renderHeaderCellContent({
                header,
            });
        }

        return (
            <React.Fragment>
                {header.column.getCanSort() ? (
                    <BaseSort header={header}>
                        {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                        {renderSortIndicator ? (
                            renderSortIndicator({
                                className: b('sort-indicator', sortIndicatorClassName),
                                header,
                            })
                        ) : (
                            <BaseSortIndicator
                                className={b('sort-indicator', sortIndicatorClassName)}
                                header={header}
                            />
                        )}
                    </BaseSort>
                ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                )}
                {header.column.getCanResize() &&
                    (renderResizeHandle ? (
                        renderResizeHandle({
                            className: b('resize-handle', resizeHandleClassName),
                            header,
                        })
                    ) : (
                        <BaseResizeHandle
                            className={b('resize-handle', resizeHandleClassName)}
                            header={header}
                        />
                    ))}
            </React.Fragment>
        );
    };

    return (
        <th
            className={b('header-cell', getHeaderCellClassModes(header), className)}
            colSpan={header.colSpan > 1 ? header.colSpan : undefined}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
            aria-sort={getAriaSort(header.column.getIsSorted())}
            aria-colindex={getHeaderCellAriaColIndex(header)}
            {...attributes}
            style={getCellStyles(header, attributes?.style)}
        >
            {renderContent()}
        </th>
    );
};
