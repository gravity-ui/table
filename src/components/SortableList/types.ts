export interface SortableListDragResult {
    draggedItemKey: string;
    targetItemKey?: string;
    baseItemKey?: string;
    baseNextItemKey?: string;
    nestingEnabled?: boolean;
    nextChild?: boolean;
    pullFromParent?: boolean;
}
