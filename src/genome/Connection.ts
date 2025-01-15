import { MAX_NODES } from "../config";
import { Gene } from "./Gene";
import { NodeGene } from "./Node";

export class ConnectionGene extends Gene {
    public from: NodeGene
    public to: NodeGene

    public weight: number = 1
    public enabled: boolean = true

    constructor(from: NodeGene, to: NodeGene) {
        super();
        this.from = from;
        this.to = to;
        
        this.innovation_number
    }

    public equals(other: ConnectionGene): boolean {
        return (this.from.equals(other.from) && this.to.equals(other.to))
    }

    public copy(): ConnectionGene {
        const copy = new ConnectionGene(this.from, this.to);
        copy.innovation_number = this.innovation_number;
        copy.weight = this.weight;
        copy.enabled = this.enabled;
        return copy;
    }

    /** Generates a unique number in this context so long as the number of nodes is less than MAX_NODES. Serves as an `id`. **/
    public hashCode(): number {
        return this.from.innovation_number * MAX_NODES + this.to.innovation_number
    }

}