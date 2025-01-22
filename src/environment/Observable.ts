import { randomUUID } from "crypto"

export class Observable {
    public id = randomUUID()
    public data: any
    constructor() { }

    /** Numeric Encoding of some state space. */
    observe(): void {
        this.data = Math.random()
    }

    // 
}