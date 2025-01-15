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
        super.step()
        for (let individual of this.individuals) {
            individual.brain.think(this.randomInput())
            individual.score = this.randomScore()
        }
    }

    public populate(amount: number = 10) {
        for (let i = 0; i < amount; i++) {
            this.spawn()
        }
    }

    public spawn() {
        let genome = this.evolution.new_genome(this.genePool)
        let body = new Body(genome)
        this.individuals.push(body)
    }

    public randomScore() {
        return Math.random()
    }

    public randomInput() {
        return Array.from({ length: this.input_size }, () => Math.random());
    }
}