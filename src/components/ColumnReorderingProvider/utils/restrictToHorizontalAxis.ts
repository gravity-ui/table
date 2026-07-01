import type {Modifier} from '@dnd-kit/core';

export const restrictToHorizontalAxis: Modifier = ({transform}) => ({...transform, y: 0});
