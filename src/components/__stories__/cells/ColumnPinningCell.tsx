import React from 'react';

import type {HeaderContext} from '@tanstack/react-table';

import type {Item} from '../types';

export interface ColumnPinningHeaderCellProps {
    value: string;
    info: HeaderContext<Item, unknown>;
}

export const ColumnPinningHeaderCell = ({value, info}: ColumnPinningHeaderCellProps) => {
    const handlePinLeft = () => {
        if (info.column.getCanPin()) {
            info.column.pin('left');
        }
    };

    const handlePinRight = () => {
        if (info.column.getCanPin()) {
            info.column.pin('right');
        }
    };

    const handleUnpin = () => {
        info.column.pin(false);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: '10px',
            }}
        >
            <div>{value}</div>
            <div style={{display: 'flex', columnGap: '10px'}}>
                <button onClick={() => handlePinLeft()}>{`<`}</button>
                <button onClick={() => handleUnpin()}>{`x`}</button>
                <button onClick={() => handlePinRight()}>{`>`}</button>
            </div>
        </div>
    );
};

export interface ColumnPinningCellProps {
    value: string;
}

export const ColumnPinningCell = ({value}: ColumnPinningCellProps) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: '10px',
            }}
        >
            <div>{value}</div>
        </div>
    );
};
