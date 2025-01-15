
export class RandomSelector<T> {
    private items: T[] = []
    private weights: number[] = []
    private totalWeight: number = 0

    constructor() {}

    public add(item: T, weight: number): void {
        this.items.push(item)
        this.weights.push(weight)
        this.totalWeight += weight
    }

    public select(): T {
        const random = Math.random() * this.totalWeight;
        let sum = 0
        for (let i = 0; i < this.items.length; i++) {
            sum += this.weights[i]
            if (random < sum) {
                return this.items[i]
            }
        }
        return this.items[this.items.length - 1]
    }

    public reset(): void {
        this.items = []
        this.weights = []
        this.totalWeight = 0
    }
}