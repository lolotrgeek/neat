
/**
 * RandomHashSet is a data structure that stores unique items and allows for random access to any item in the set.
 */
export class RandomHashSet {
    public data: any[];
    public map: Map<number, any>;

    constructor() {
        this.data = []; // TODO: maybe we don't need this... and can just use the map
        this.map = new Map();
    }

    public add(item: any): void {
        if (!this.map.has(item.hashCode())) {
            this.data.push(item);
            this.map.set(item.hashCode(), item);
        }
    }

    public get(index: number): any {
        return this.data[index];
    }

    public getAll(): any[] {
        return this.data;
    }

    public remove(item: any): void {
        if (this.map.has(item.hashCode())) {
            this.map.delete(item.hashCode());
            this.data.splice(this.data.indexOf(item), 1);
        }
    }

    public contains(item: any): boolean {
        return this.map.has(item.hashCode());
    }

    public size(): number {
        return this.data.length;
    }

    public getRandom(): any {
        return this.data[Math.floor(Math.random() * this.data.length)];
    }

    public clear(): void {
        this.data = [];
        this.map.clear();
    }
}