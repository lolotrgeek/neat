/** Expression of Actor Gene, maps to an output neuron. */
export class Action {
    /** The index of the lever this action pulls */
    lever: number = 0
    constructor() { }

    act(output: number): number {
        return output
    }
}