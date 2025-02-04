import { Gene } from "./Gene";

/** Sense Genes tell the body which Observable it can sense, their parameters and how to connect those observables to the brain's input neurons. */
export class SenseGene extends Gene {
    /** The "frequency" that this sensor can detect */
    frequency: number = 0
    constructor() {
        super();
    }
}