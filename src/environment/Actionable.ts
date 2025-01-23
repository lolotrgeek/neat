
/** A possible action */
export class Actionable {
    constructor() { }

    /** Perform the action */
    act(input: number): number {
        return Math.random()
    }

}