/**
 * Selects random indices from a range of numbers.
 * @param total 
 * @param count 
 * @returns 
 */
export function selectRandomIndices(total: number, count: number): number[] {
    const indices = [...Array(total).keys()];
    // Shuffle in-place using Fisher–Yates algorithm
    for (let i = indices.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[r]] = [indices[r], indices[i]];
    }
    return indices.slice(0, count);
}