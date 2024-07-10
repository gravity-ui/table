import {toDataAttributes} from '../toDataAttributes';

describe('toDataAttributes', () => {
    it('should convert object to data attributes', () => {
        expect(
            toDataAttributes({
                a: 'text',
                b: 42,
                c: 0,
                d: true,
                e: false,
                f: null,
                g: undefined,
            }),
        ).toEqual({
            'data-a': 'text',
            'data-b': '42',
            'data-c': '0',
            'data-d': 'true',
            'data-e': 'false',
        });
    });
});
