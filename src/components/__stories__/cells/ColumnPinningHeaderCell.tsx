import React from 'react';

import type {HeaderContext} from '@tanstack/react-table';

import {cnColumnPinningDemo} from '../components/BaseTable/ColumnPinningDemo.classname';

interface ColumnPinningHeaderCellProps<TData> {
    info: HeaderContext<TData, unknown>;
    value: string;
}

export const ColumnPinningHeaderCell = <TData,>({
    value,
    info,
}: ColumnPinningHeaderCellProps<TData>) => {
    const canPin = info.column.getCanPin();

    const canPinLeft = canPin && info.column.getIsPinned() !== 'left';
    const canPinRight = canPin && info.column.getIsPinned() !== 'right';
    const canUnpin = canPin && info.column.getIsPinned();

    const handlePinLeft = () => {
        info.column.pin('left');
    };

    const handlePinRight = () => {
        info.column.pin('right');
    };

    const handleUnpin = () => {
        info.column.pin(false);
    };

    return (
        <div className={cnColumnPinningDemo('header-cell')}>
            <div>{value}</div>
            {canPin && (
                <div>
                    {canPinLeft && <button onClick={handlePinLeft}>{`<`}</button>}
                    {canUnpin && <button onClick={handleUnpin}>{`x`}</button>}
                    {canPinRight && <button onClick={handlePinRight}>{`>`}</button>}
                </div>
            )}
        </div>
    );
};
