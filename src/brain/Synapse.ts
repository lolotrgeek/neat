// Application of ConnectionGene

import { Neuron } from "./Neuron"

export class Synapse {
    public from: Neuron
    public to: Neuron

    public weight: number = 1
    public enabled: boolean = true

    constructor(from: Neuron, to: Neuron) {
        this.from = from;
        this.to = to;
    }

    
}