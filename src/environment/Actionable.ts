import { Body } from "../body/Body"

/** A possible action */
export class Actionable {
    constructor() { }

    /** Perform the action */
    act(input: number, individual: Body): number {
        return Math.random()
    }

}