import {arraysShallowEqual} from '../arraysShallowEqual';

describe('arraysShallowEqual', () => {
    it('returns true for the same reference', () => {
        const a = [1, 'x', null];
        expect(arraysShallowEqual(a, a)).toBe(true);
    });

    it('returns true for arrays with element-wise equal primitives', () => {
        expect(arraysShallowEqual([1, 'x', true], [1, 'x', true])).toBe(true);
    });

    it('returns false when lengths differ', () => {
        expect(arraysShallowEqual([1, 2], [1, 2, 3])).toBe(false);
        expect(arraysShallowEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it('returns false when any element differs by Object.is', () => {
        expect(arraysShallowEqual([1, 'x', true], [1, 'x', false])).toBe(false);
    });

    it('uses Object.is, not ===, for NaN', () => {
        expect(arraysShallowEqual([NaN], [NaN])).toBe(true);
    });

    it('uses Object.is, not ===, for +0 / -0', () => {
        expect(arraysShallowEqual([0], [-0])).toBe(false);
    });

    it('returns true for two empty arrays', () => {
        expect(arraysShallowEqual([], [])).toBe(true);
    });

    it('compares object references, not deep contents', () => {
        const obj = {a: 1};
        expect(arraysShallowEqual([obj], [obj])).toBe(true);
        expect(arraysShallowEqual([{a: 1}], [{a: 1}])).toBe(false);
    });
});
