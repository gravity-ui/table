import React from 'react';

import {b} from './DraggableRowMarker.classname';

import './DraggableRowMarker.scss';

export interface DraggableRowMarkerProps {
    left: number;
}

export const DraggableRowMarker = ({left}: DraggableRowMarkerProps) => {
    return <span className={b()} style={{left}} />;
};
