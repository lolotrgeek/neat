// The application of NodeGene

import { Synapse } from "./Synapse";

export class Neuron {
    /** The x coordinate of the node, need position so connections can be directional, avoiding recursion */
    public x: number = .1;
    /** The y coordinate of the node, need position so connections can be directional, avoiding recursion */
    public y: number = .9;

    public output: number = 0;
    /** Which other neurons are we connected from */
    public connections: Synapse[] = [];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
     // TODO: make this functional
    /**
     * Stimulate the neuron, invoking it's activation function
     */
    public stimulate(): void {
        // TODO: do we want to stimulate neurons with no connections?
        if (this.connections.length === 0) {
            return
        }

        let sum = 0;
        for (const connection of this.connections) {
            if (connection.enabled) {
                sum += connection.from.output * connection.weight;
            }
        }

        //TODO: parameterize this
        this.output = this.sigmoid(sum);
        return
    }

    /**
     * 
     * @param sum of neuron ouputs and synapse weights 
     * @returns 
     */
    public sigmoid(sum: number): number {
        return 1 / (1 + Math.exp(-sum));
    }

    public compareTo(other: Neuron): number {
        if(this.x > other.x) return -1
        if(this.x < other.x) return 1
        return 0
    }

}