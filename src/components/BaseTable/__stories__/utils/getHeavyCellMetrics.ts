export interface HeavyCellMetrics {
    average: number;
    bars: number[];
    current: number;
    points: string;
    p95: number;
    trend: number;
}

export function getHeavyCellMetrics(rowId: string, columnIndex: number): HeavyCellMetrics {
    let seed = columnIndex + 1;
    for (let index = 0; index < rowId.length; index += 1) {
        seed = (seed * 31 + rowId.charCodeAt(index)) % 4294967296;
    }

    const samples = Array.from({length: 48}, (_value, index) => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        const noise = (seed % 1000) / 25;
        const wave = Math.sin((index + columnIndex) / 4) * 18;

        return Math.max(2, 35 + (columnIndex % 7) * 6 + wave + noise);
    });
    const sortedSamples = [...samples].sort((left, right) => left - right);
    const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const current = samples.at(-1) ?? 0;
    const previous = samples.at(-2) ?? current;
    const max = Math.max(...samples);
    const min = Math.min(...samples);
    const valueRange = Math.max(1, max - min);
    const points = samples
        .map((value, index) => {
            const x = (index / (samples.length - 1)) * 100;
            const y = 19 - ((value - min) / valueRange) * 17;

            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');

    return {
        average,
        bars: samples.slice(-10).map((value) => Math.max(3, (value / max) * 18)),
        current,
        points,
        p95: sortedSamples[Math.floor(sortedSamples.length * 0.95)] ?? current,
        trend: ((current - previous) / Math.max(1, previous)) * 100,
    };
}
