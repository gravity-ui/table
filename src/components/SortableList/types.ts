export interface SortableListDragResult {
    draggedItemKey: string;
    targetItemKey?: string;
    baseItemKey?: string;
    baseNextItemKey?: string;
    enableNesting?: boolean;
    nextChild?: boolean;
    pullFromParent?: boolean;
}
