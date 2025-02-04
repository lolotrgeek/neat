/** Expression of an Actor Gene, maps an output neuron to an environment's actionable. */
export class Action {
    /** The index of the actionable from the environment this action invokes */
    actionable: number = 0
    constructor(actionable: number) {
        this.actionable = actionable
     }

    /** Decode the brain output and return the value */
    act(output: number): number {
        return output
    }
}