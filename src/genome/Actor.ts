import { Gene } from "./Gene";

/** Actor Genes give instructions on which actions a body can take, their parameters, and how to connect those actions to output neurons of brain. */
export class ActorGene extends Gene {
    constructor() {
        super()
    }

    // for example, if we generate an actor gene for a "buy" action, with parameters:
    // - amount to spend
    // - slippage

    // evolution can mutate these parameters within a range
}