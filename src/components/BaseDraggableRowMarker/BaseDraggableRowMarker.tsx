import React from 'react';

import {b} from './BaseDraggableRowMarker.classname';

import './BaseDraggableRowMarker.scss';

export interface BaseDraggableRowMarkerProps {
    left: number;
}

export const BaseDraggableRowMarker = ({left}: BaseDraggableRowMarkerProps) => {
    return <span className={b()} style={{left}} />;
};
