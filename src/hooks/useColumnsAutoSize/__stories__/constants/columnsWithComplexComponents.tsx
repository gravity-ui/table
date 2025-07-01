import {ArrowToggle, Button} from '@gravity-ui/uikit';
import type {ColumnDef} from '@tanstack/react-table';

import type {Person} from '../types';

export const columnsWithComplexComponents: ColumnDef<Person>[] = [
    {
        accessorKey: 'firstName',
        header: 'First Name',
        cell: (info) => (
            <div
                style={{
                    paddingLeft: 28 * info.row.depth,
                }}
            >
                {info.row.getCanExpand() && (
                    <Button view="flat" size="s" onClick={info.row.getToggleExpandedHandler()}>
                        <ArrowToggle
                            direction={info.row.getIsExpanded() ? 'bottom' : 'right'}
                            size={16}
                        />
                    </Button>
                )}
                {info.getValue<string>()}
            </div>
        ),
    },
    {
        accessorKey: 'lastName',
        header: 'Last Name',
    },
    {
        accessorKey: 'age',
        header: 'Age',
    },
    {
        accessorKey: 'status',
        header: () => (
            <div style={{display: 'flex', alignItems: 'center'}}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{marginRight: '8px'}}
                >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path
                        d="M12 6v6l4 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                Status
            </div>
        ),
        cell: (info) => {
            const status = info.getValue<Person['status']>();
            const statusConfig = {
                single: {color: '#4caf50', icon: '👤'},
                relationship: {color: '#2196f3', icon: '👫'},
                complicated: {color: '#ff9800', icon: '⚠️'},
                married: {color: '#9c27b0', icon: '💍'},
            };

            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        backgroundColor: `${statusConfig[status].color}20`,
                        borderRadius: '4px',
                        color: statusConfig[status].color,
                    }}
                >
                    <span style={{marginRight: '6px'}}>{statusConfig[status].icon}</span>
                    <span>{status}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'progress',
        header: () => (
            <div style={{display: 'flex', alignItems: 'center', padding: '0 10px'}}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{marginRight: '8px'}}
                >
                    <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 21V9" stroke="currentColor" strokeWidth="2" />
                </svg>
                Progress
            </div>
        ),
        cell: (info) => {
            const progress = info.getValue<number>();

            return (
                <div style={{width: '100%', position: 'relative', padding: '10px'}}>
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: '#f0f0f0',
                            height: '10px',
                            borderRadius: '5px',
                        }}
                    >
                        <div
                            style={{
                                width: `${progress}%`,
                                backgroundColor:
                                    progress < 40
                                        ? '#f44336'
                                        : progress < 70
                                          ? '#ff9800'
                                          : '#4caf50',
                                height: '100%',
                                borderRadius: '5px',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '4px',
                        }}
                    >
                        <span style={{fontSize: '0.7em', color: '#666'}}>Started</span>
                        <span
                            style={{
                                fontSize: '0.8em',
                                fontWeight: 'bold',
                                color:
                                    progress < 40
                                        ? '#f44336'
                                        : progress < 70
                                          ? '#ff9800'
                                          : '#4caf50',
                            }}
                        >
                            {progress}%
                        </span>
                        <span style={{fontSize: '0.7em', color: '#666'}}>Done</span>
                    </div>
                </div>
            );
        },
    },
];
