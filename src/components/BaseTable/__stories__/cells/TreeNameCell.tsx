import {ArrowToggle, Button, Flex} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

export interface TreeNameCellProps<TData> {
    row: Row<TData>;
    depth?: number;
    value: string;
}

export const TreeNameCell = <TData,>({row, value}: TreeNameCellProps<TData>) => {
    return (
        <Flex>
            <Button
                style={{marginBlock: -3, visibility: row.getCanExpand() ? 'visible' : 'hidden'}}
                view="flat"
                size="s"
                onClick={row.getToggleExpandedHandler()}
            >
                <Button.Icon>
                    <ArrowToggle direction={row.getIsExpanded() ? 'bottom' : 'right'} size={16} />
                </Button.Icon>
            </Button>
            {value}
        </Flex>
    );
};
