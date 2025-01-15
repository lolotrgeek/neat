import { Brain } from "./brain/Brain"
import { Genome } from "./genome/Genome"
import { Species } from "./Species"

export class Body {
    public genome: Genome
    public brain: Brain 
    public species: Species | null = null
    /** the individual's fitness */
    public score: number = 0

    constructor(genome: Genome) {
        this.genome = genome
        this.brain = new Brain(genome)
        // TODO: add actors and sensors
    }

    public distance (body: Body): number {
        return this.genome.distance(body.genome)
    }

    public hashCode(): number {
        // generate a hashcode from the nodes and connections in the genome
        let hash = 0
        for (let node of this.genome.nodes.getAll()) {
            hash += node.innovation_number
        }
        for (let connection of this.genome.connections.getAll()) {
            hash += connection.getHash()
        }
        return hash
    }

}