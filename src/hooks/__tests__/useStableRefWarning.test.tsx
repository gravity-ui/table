import {render} from '@testing-library/react';

import {useStableRefWarning} from '../useStableRefWarning';

describe('useStableRefWarning', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    function Probe({name, value, enabled}: {name: string; value: unknown; enabled: boolean}) {
        useStableRefWarning(name, value, enabled);
        return null;
    }

    it('does not warn when ref is stable', () => {
        const stable = () => {};
        const {rerender} = render(<Probe name="rowAttributes" value={stable} enabled />);
        rerender(<Probe name="rowAttributes" value={stable} enabled />);
        rerender(<Probe name="rowAttributes" value={stable} enabled />);

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns once per name when ref changes between renders', () => {
        const {rerender} = render(<Probe name="rowAttributes" value={() => {}} enabled />);
        rerender(<Probe name="rowAttributes" value={() => {}} enabled />);
        rerender(<Probe name="rowAttributes" value={() => {}} enabled />);

        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0][0]).toContain('rowAttributes');
        expect(warnSpy.mock.calls[0][0]).toContain('experimentalMemoization');
    });

    it('does not warn when enabled is false', () => {
        const {rerender} = render(<Probe name="rowAttributes" value={() => {}} enabled={false} />);
        rerender(<Probe name="rowAttributes" value={() => {}} enabled={false} />);

        expect(warnSpy).not.toHaveBeenCalled();
    });
});
