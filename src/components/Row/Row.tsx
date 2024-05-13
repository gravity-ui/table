import React from 'react';

import {BaseRow} from '../BaseRow';
import type {BaseRowProps} from '../BaseRow';
import {DraggableRow} from '../DraggableRow';
import type {VirtualRowProps} from '../VirtualRow';
import {VirtualRow} from '../VirtualRow';

export interface RowProps<TData> extends BaseRowProps<TData> {
    draggable?: boolean;
    virtualRow?: VirtualRowProps<TData>['virtualRow'];
}

export const Row = React.forwardRef(
    <TData,>(props: RowProps<TData>, ref: React.Ref<HTMLTableRowElement>) => {
        const {draggable, virtualRow} = props;

        if (virtualRow) {
            return <VirtualRow {...props} virtualRow={virtualRow!} ref={ref} />;
        }

        if (draggable) {
            return <DraggableRow {...props} ref={ref} />;
        }

        return <BaseRow {...props} ref={ref} />;
    },
) as (<TData>(
    props: RowProps<TData> & {ref?: React.Ref<HTMLTableRowElement>},
) => React.ReactElement) & {
    displayName: string;
};

Row.displayName = 'Row';
