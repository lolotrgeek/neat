import { randomUUID } from "crypto"
import { Brain } from "../brain/Brain"
import { Genome } from "../genome/Genome"
import { SpeciesId } from "../Species"
import { Action } from "./Action"
import { Sensor } from "./Sensor"

export type BodyId = string

export class Body {
    public id: BodyId = randomUUID()
    public genome: Genome
    public brain: Brain
    public actions: Action[] = []
    public sensors: Sensor[] = []
    public species: SpeciesId | null = null
    /** the individual's fitness */
    public score: number = 0

    constructor(genome: Genome) {
        this.genome = genome
        this.brain = new Brain(genome)
        // TODO: add actors and sensors
    }

    public distance(body: Body): number {
        return this.genome.distance(body.genome)
    }

    /**
     * Decodes the output of the brain to an action, the first output with the highest value is selected. 
     * 
     * `TODO`: could add a threshold to select the action and confidence levels
     * @param out 
     * @returns the index of the action to perform 
     */
    public static actionFromOutput(out: number[]): number {
        let index = 0;
        for (let i = 1; i < out.length; i++) {
            if (out[i] > out[index]) {
                index = i;
            }
        }
        return index - 1;
    }

    public hashCode(): number {
        // generate a hashcode from the nodes and connections in the genome
        let hash = 0
        for (let node of this.genome.nodes.getAll()) {
            hash += node.innovation_number
        }
        for (let connection of this.genome.connections.getAll()) {
            hash += connection.from.innovation_number + connection.to.innovation_number
        }
        return hash
    }

}