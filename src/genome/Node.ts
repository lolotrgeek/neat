import { Gene } from "./Gene"

export class NodeGene extends Gene {
    public id = 0;
    /** The x coordinate of the node, need position so connections can be directional, avoiding recursion */
    public x: number = .1;
    /** The y coordinate of the node, need position so connections can be directional, avoiding recursion */
    public y: number = .9;

    constructor() {
        super();
        this.id = this.innovation_number;
    }

    public equals(other: NodeGene): boolean {
        return this.innovation_number === other.innovation_number;
    }

    public copy(): NodeGene {
        const copy = new NodeGene();
        copy.innovation_number = this.innovation_number;
        copy.x = this.x;
        copy.y = this.y;
        return copy;
    }

}