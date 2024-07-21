import React from 'react';

import type {Header} from '@tanstack/react-table';

import {b} from './ResizeHandle.classname';

import './ResizeHandle.scss';

export interface ResizeHandleProps<TData, TValue> {
    className?: string;
    header: Header<TData, TValue>;
}

export const ResizeHandle = <TData, TValue>({
    className,
    header,
}: ResizeHandleProps<TData, TValue>) => {
    const {table} = header.getContext();
    const {columnResizeDirection, columnResizeMode} = table.options;
    const {columnSizingInfo} = table.getState();
    const offset = (columnResizeDirection === 'rtl' ? -1 : 1) * (columnSizingInfo.deltaOffset ?? 0);

    return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
            className={b(
                {
                    direction: columnResizeDirection,
                    resizing: header.column.getIsResizing(),
                },
                className,
            )}
            onDoubleClick={() => header.column.resetSize()}
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            style={{
                transform:
                    columnResizeMode === 'onEnd' && header.column.getIsResizing()
                        ? `translateX(${offset}px)`
                        : undefined,
            }}
        />
    );
};
