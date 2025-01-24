import { randomUUID } from "crypto"

export class Observable {
    public id = randomUUID()
    constructor() { }

    /** Numeric Encoding of some state space. */
    observe(): number {
        return Math.random()
    }

    // 
}