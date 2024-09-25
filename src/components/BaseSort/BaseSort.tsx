import React from 'react';

import {useActionHandlers} from '@gravity-ui/uikit';
import type {Header} from '@tanstack/react-table';

import {b} from '../BaseTable/BaseTable.classname';

export interface BaseSortProps<TData, TValue>
    extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'className' | 'onClick'> {
    className?: string;
    header: Header<TData, TValue>;
}

export const BaseSort = <TData, TValue>({
    header,
    className,
    children,
    ...restProps
}: BaseSortProps<TData, TValue>) => {
    const handleKeyDown = header.column.getToggleSortingHandler();
    const {onKeyDown} = useActionHandlers(handleKeyDown);

    return (
        <span
            className={b('sort', className)}
            role="button"
            tabIndex={0}
            onClick={handleKeyDown}
            onKeyDown={onKeyDown}
            {...restProps}
        >
            {children}
        </span>
    );
};
