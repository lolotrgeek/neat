export function alignArrays(arr1: any[], arr2: any[]): void {
    const maxLen = Math.max(arr1.length, arr2.length);
    let i = 0;

    // Insert NaN where elements don't match or are missing
    while (i < arr1.length && i < arr2.length) {
        if (arr1[i] !== arr2[i]) {
            arr2.splice(i, 0, NaN);
        }
        i++;
    }

    // If arr2 is still too short, fill up with NaNs at the end
    while (arr2.length < maxLen) {
        arr2.push(NaN);
    }
}