import { Body } from "./Body";
import { Environment } from "./Environment";
import { Evolution } from "./Evolution";
import { GenePool } from "./GenePool";

export class TestEnvironment extends Environment {
    public input_size = 3;
    constructor(evolution: Evolution, genePool: GenePool) {
        super(evolution, genePool)
    }

    public step() {
        for (let individual of this.individuals()) {
            individual.brain.think(this.randomInput())
            individual.score = this.randomScore()
            // console.log(individual.genome.getConnections().map(c => c.innovation_number).join(' '))
        }
        super.step()
    }

    public populate(amount: number = 10) {
        for (let i = 0; i < amount; i++) {
            this.spawn()
        }
    }

    public reproduce(): void {
        // Call reproduce between 10 and 20 times
        for (let i = 0; i < Math.floor(Math.random() * 10) + 10; i++) super.reproduce()
    }

    public spawn() {
        let genome = this.evolution.new_genome(this.genePool)
        let body = new Body(genome)
        // call mutate_link between 10 and 20 times
        for (let i = 0; i < Math.floor(Math.random() * 10) + 10; i++) this.evolution.mutate_link(genome, this.genePool)
        this.assign_species(body)
        // console.table(body.genome.connections.getAll().map(c => ({ in: c.innovation_number, weight: c.weight })))
    }

    public randomScore() {
        return Math.random()
    }

    public randomInput() {
        return Array.from({ length: this.input_size }, () => Math.random());
    }
}