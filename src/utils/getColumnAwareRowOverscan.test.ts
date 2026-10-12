import {getColumnAwareRowOverscan} from './getColumnAwareRowOverscan';
import type {ColumnAwareRowOverscanOptions} from './getColumnAwareRowOverscan';

describe('getColumnAwareRowOverscan', () => {
    it.each([
        [1, 24],
        [10, 24],
        [20, 12],
        [21, 11],
        [100, 4],
    ])('uses a bounded cell budget for %i columns', (columnCount, expected) => {
        expect(getColumnAwareRowOverscan(columnCount)).toBe(expected);
    });

    it('budgets only the columns rendered with horizontal virtualization', () => {
        expect(getColumnAwareRowOverscan(100, {renderedColumnLimit: 20})).toBe(12);
        expect(getColumnAwareRowOverscan(10, {renderedColumnLimit: 20})).toBe(24);
    });

    it('keeps a finite overscan while columns are loading or hidden', () => {
        expect(getColumnAwareRowOverscan(0)).toBe(24);
        expect(getColumnAwareRowOverscan(100, {renderedColumnLimit: 0})).toBe(24);
    });

    it('allows tuning the budget and both bounds for different cell rendering costs', () => {
        const options = {cellBudget: 100, minOverscan: 2, maxOverscan: 10};

        expect(getColumnAwareRowOverscan(1, options)).toBe(10);
        expect(getColumnAwareRowOverscan(20, options)).toBe(5);
        expect(getColumnAwareRowOverscan(100, options)).toBe(2);
    });

    it('allows disabling base overscan explicitly', () => {
        expect(getColumnAwareRowOverscan(20, {minOverscan: 0, maxOverscan: 0})).toBe(0);
        expect(getColumnAwareRowOverscan(20, {cellBudget: 0, minOverscan: 0})).toBe(0);
    });

    it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
        'rejects an invalid column count: %s',
        (columnCount) => {
            expect(() => getColumnAwareRowOverscan(columnCount)).toThrow(RangeError);
        },
    );

    it.each<keyof ColumnAwareRowOverscanOptions>([
        'renderedColumnLimit',
        'cellBudget',
        'minOverscan',
        'maxOverscan',
    ])('rejects invalid %s values', (option) => {
        for (const value of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
            expect(() => getColumnAwareRowOverscan(20, {[option]: value})).toThrow(RangeError);
        }
    });

    it('rejects conflicting overscan bounds', () => {
        expect(() => getColumnAwareRowOverscan(20, {minOverscan: 10, maxOverscan: 5})).toThrow(
            'maxOverscan must be greater than or equal to minOverscan',
        );
    });
});
