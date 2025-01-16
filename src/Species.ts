import { randomUUID } from "crypto";
import { Body } from "./Body";
import { SPECIATION_THRESHOLD } from "./config";
import { Evolution } from "./Evolution";
import { GenePool } from "./GenePool";

const DEBUG = false
const log = (msg: string) => DEBUG && console.log(msg)

export type SpeciesId = string

/**
 * Species is a collection of individuals that are similar to each other.
 */
export class Species {
    public id = randomUUID()
    public evolution: Evolution
    public genePool: GenePool
    public individuals: Body[] = []
    /** The individual that represents the species. Typically the first memeber of the species */
    public representative: Body
    /** Average score of all individuals in species */
    public score: number = 0

    constructor(representative: Body, evolution: Evolution, genePool: GenePool) {
        this.evolution = evolution
        this.genePool = genePool
        this.representative = representative
        representative.species = this.id
        this.individuals.push(representative)
    }

    /**
     * Check if the individual is similar to the species representative. If it is, add it to the species.
     * @param individual 
     * @returns 
     */
    public add(individual: Body): boolean {
        // TODO: speciation should first be based on type of actor (output) and sensor (input) genes
        // SUB species then is determined by distance between genomes
        if (individual.distance(this.representative) < SPECIATION_THRESHOLD) {
            this._add(individual)
            return true
        }
        return false
    }

    /**
     * Add an individual to the species.
     * @param individual
     * @returns
    */
    public _add(individual: Body): void {
        individual.species = this.id
        this.individuals.push(individual)
    }

    /**
     * Remove all individuals from the species.
     */
    public extinction(): void {
        for (let individual of this.individuals) {
            individual.species = null
        }
        this.individuals = []
    }

    /**
     * Evaluate the species by calculating the average score of all individuals in the species.
     */
    public evaluate(): void {
        let total = 0
        for (let individual of this.individuals) {
            total += individual.score
        }
        this.score = total / this.individuals.length
    }

    /**
     * Choose a new representative for the species, orphan all other individuals and set score to 0.
     */
    public reset(): Body[] {
        // select a random member of the species to be the new representative
        this.representative = this.getRandom()
        for (let individual of this.individuals) {
            individual.species = null
        }
        const orphans = this.individuals
        this.individuals = []
        this.representative.species = this.id
        this.individuals.push(this.representative)
        this.score = 0
        return orphans
    }

    public getRandom(): Body {
        return this.individuals[Math.floor(Math.random() * this.individuals.length)]
    }

    /**
     * Kills a percentage of the worst individuals in the species.
     * @param percentage default is 0.5 or the worst half of the species
     * @todo: move this to environment
     * @todo: could use 3 sigma to determine who dies
     */
    public kill(percentage: number = 0.5): void {
        log(`Current Scores: ${this.individuals.map(i => i.score).join(", ")}`)
        let sorted = this.individuals.sort((a, b) => a.score - b.score)
        let kill_count = Math.floor(sorted.length * percentage)
        for (let i = 0; i < kill_count; i++) {
            sorted[i].species = null
            this.individuals.splice(i,1)
        }
    }

    /**
     * Create a new individual by breeding
     * @param parent_1 
     * @param parent_2 
     * @returns 
     */
    public breed(parent_1: Body, parent_2: Body): Body {
        // find which individual has the higher score
        let best = parent_1.score > parent_2.score ? parent_1 : parent_2
        const child_genome = this.evolution.crossover(parent_1.genome, parent_2.genome, this.genePool)
        return new Body(child_genome) // TODO: automatically add to species?
    }

    public population (): number {
        return this.individuals.length
    }


}