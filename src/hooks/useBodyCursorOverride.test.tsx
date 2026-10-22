import {act, renderHook} from '@testing-library/react';

import {useBodyCursorOverride} from './useBodyCursorOverride';

describe('useBodyCursorOverride', () => {
    afterEach(() => {
        document.body.style.removeProperty('cursor');
    });

    it('does not change the cursor when unmounted without an override', () => {
        document.body.style.setProperty('cursor', 'crosshair', 'important');
        const {unmount} = renderHook(() => useBodyCursorOverride());

        unmount();

        expect(document.body.style.getPropertyValue('cursor')).toBe('crosshair');
        expect(document.body.style.getPropertyPriority('cursor')).toBe('important');
    });

    it('restores the previous cursor after releasing its override', () => {
        document.body.style.setProperty('cursor', 'crosshair', 'important');
        const {result} = renderHook(() => useBodyCursorOverride());

        act(() => result.current.setBodyCursor('grabbing'));
        expect(document.body.style.getPropertyValue('cursor')).toBe('grabbing');

        act(() => result.current.restoreBodyCursor());
        expect(document.body.style.getPropertyValue('cursor')).toBe('crosshair');
        expect(document.body.style.getPropertyPriority('cursor')).toBe('important');
    });

    it('does not overwrite a cursor changed by another owner', () => {
        document.body.style.setProperty('cursor', 'crosshair');
        const {result} = renderHook(() => useBodyCursorOverride());

        act(() => result.current.setBodyCursor('grabbing'));
        document.body.style.setProperty('cursor', 'wait');
        act(() => result.current.restoreBodyCursor());

        expect(document.body.style.getPropertyValue('cursor')).toBe('wait');
    });
});
