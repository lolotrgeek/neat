/**
 * Randomly generate a number from a normal distribution
 * @param mean 
 * @param stdDev 
 * @returns 
 */
export function randomNormal(mean: number, stdDev: number): number {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
}