import * as React from 'react';

import {getScrollableAncestors} from '@dnd-kit/core';

import {useIsomorphicLayoutEffect} from '../../../hooks/useIsomorphicLayoutEffect';

export const DRAG_SCROLL_COMPENSATION_PROPERTY = '--g-table-drag-scroll-compensation';
export const DRAG_SCROLL_COMPENSATION_TRANSFORM = `translate3d(0, var(${DRAG_SCROLL_COMPENSATION_PROPERTY}, 0px), 0)`;

interface UseDragScrollCompensationProps {
    enabled: boolean;
    nodeRef: React.RefObject<HTMLTableRowElement>;
    renderedTransformY?: number;
}

export function useDragScrollCompensation({
    enabled,
    nodeRef,
    renderedTransformY,
}: UseDragScrollCompensationProps) {
    const pointerYRef = React.useRef<number>();
    const dragStartRef = React.useRef<{
        element: HTMLTableRowElement;
        pointerY?: number;
        scrollTop: number;
        transformY: number;
    }>();

    useIsomorphicLayoutEffect(() => {
        const node = nodeRef.current;
        if (!enabled || !node) {
            if (node) {
                node.style.removeProperty(DRAG_SCROLL_COMPENSATION_PROPERTY);
            }
            pointerYRef.current = undefined;
            dragStartRef.current = undefined;

            return undefined;
        }

        const ownerDocument = node.ownerDocument;
        const ownerWindow = ownerDocument.defaultView;
        const scrollableAncestors = getScrollableAncestors(node);
        const getScrollTop = () =>
            scrollableAncestors.reduce((total, ancestor) => {
                if (ancestor === ownerDocument.scrollingElement) {
                    return total + (ownerWindow?.scrollY ?? 0);
                }

                return total + ancestor.scrollTop;
            }, 0);
        if (
            !dragStartRef.current ||
            dragStartRef.current.element !== node ||
            dragStartRef.current.pointerY !== pointerYRef.current
        ) {
            dragStartRef.current = {
                element: node,
                pointerY: pointerYRef.current,
                scrollTop: getScrollTop(),
                transformY: renderedTransformY ?? 0,
            };
        }

        const dragStart = dragStartRef.current;
        const scrollTargets = new Set<EventTarget>(
            scrollableAncestors.map((ancestor) =>
                ancestor === ownerDocument.scrollingElement && ownerWindow ? ownerWindow : ancestor,
            ),
        );
        const trackPointer = (event: PointerEvent) => {
            pointerYRef.current = event.clientY;
        };
        const compensateScroll = () => {
            const scrollDelta = getScrollTop() - dragStart.scrollTop;
            const renderedTransformDelta = (renderedTransformY ?? 0) - dragStart.transformY;

            node.style.setProperty(
                DRAG_SCROLL_COMPENSATION_PROPERTY,
                `${scrollDelta - renderedTransformDelta}px`,
            );
        };

        compensateScroll();
        scrollTargets.forEach((target) =>
            target.addEventListener('scroll', compensateScroll, {passive: true}),
        );
        ownerWindow?.addEventListener('pointermove', trackPointer, {capture: true, passive: true});

        return () => {
            scrollTargets.forEach((target) =>
                target.removeEventListener('scroll', compensateScroll),
            );
            ownerWindow?.removeEventListener('pointermove', trackPointer, {capture: true});
        };
    }, [enabled, nodeRef, renderedTransformY]);
}
