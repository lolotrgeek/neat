import { RandomHashSet } from "../data_structures/random_hashset";

export type InnovationNumber = number;

export class GeneStore extends RandomHashSet {
    public data: Gene[]
    public map: Map<InnovationNumber, Gene>
    
    constructor() {
        super();
        this.data = [] as Gene[]
        this.map = new Map<InnovationNumber, Gene>();
    }

    public add_sorted(new_gene: Gene): void {
        for (let i = 0; i < this.data.length; i++) {
            let current_innovation_number = this.data[i].innovation_number;
            if (new_gene.innovation_number < current_innovation_number) {
                this.data.splice(i, 0, new_gene);
                this.map.set(new_gene.hashCode(), new_gene);
                return;
            }
        }
        this.data.push(new_gene);
        this.map.set(new_gene.hashCode(), new_gene);
    }
}

export class Gene {
    public innovation_number: InnovationNumber = 0;

    constructor() {}

    public hashCode(): InnovationNumber {
        return this.innovation_number;
    }
}