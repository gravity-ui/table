import {ArrowToggle, Button} from '@gravity-ui/uikit';
import type {Row} from '@tanstack/react-table';

export interface TreeNameCellProps<TData> extends React.PropsWithChildren {
    row: Row<TData>;
    depth?: number;
}

export const TreeNameCell = <TData,>({row, children, depth}: TreeNameCellProps<TData>) => {
    return (
        <div
            style={{
                paddingLeft: 28 * (depth ?? row.depth),
            }}
        >
            {row.getCanExpand() && (
                <Button view="flat" size="s" onClick={row.getToggleExpandedHandler()}>
                    <ArrowToggle direction={row.getIsExpanded() ? 'bottom' : 'right'} size={16} />
                </Button>
            )}
            {children}
        </div>
    );
};
