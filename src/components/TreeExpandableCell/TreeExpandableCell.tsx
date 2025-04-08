import * as React from 'react';

import {ArrowToggle, Button, Flex} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

import {b} from '../Table/Table.classname';

export interface TreeExpandableCellProps<TData> extends React.PropsWithChildren {
    row: Row<TData>;
}

export const TreeExpandableCell = <TData,>({row, children}: TreeExpandableCellProps<TData>) => {
    return (
        <Flex>
            <Button
                className={b('expanding-control', {visible: row.getCanExpand()})}
                view="flat"
                size="s"
                onClick={row.getToggleExpandedHandler()}
            >
                <Button.Icon>
                    <ArrowToggle direction={row.getIsExpanded() ? 'bottom' : 'right'} size={16} />
                </Button.Icon>
            </Button>
            {children}
        </Flex>
    );
};
