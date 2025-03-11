/**
 * Robustly normalizes a value from an arbitrary range [min, max] to a value in the range [0, 1].
 * If min and max are equal, returns 0.5.
 */
export function robustNormalize(value: number, min: number, max: number): number {
    if (min === max) {
        return 0.5;
    }
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}