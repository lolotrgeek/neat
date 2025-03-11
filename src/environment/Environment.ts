import { Body } from "../body/Body";
import { BIRTH_RATE, CULL_THRESHOLD, MAX_SPECIES } from "../config";
import { RandomSelector } from "../data_structures/random_selector";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { Species, SpeciesId } from "../Species";

const DEBUG = false
const log = (msg: string) => DEBUG && console.log(msg)

/**
 * Environment runs evolutionary processes and tracks individuals, species, and genes.
 */
export class Environment {
    public evolution: Evolution
    public genePool: GenePool
    public species: Species[] = []

    constructor(evolution: Evolution, genePool?: GenePool) {
        this.evolution = evolution
        this.genePool = genePool || new GenePool()
    }

    public step() {
        this.speciate()
        this.cull()
        this.remove_extinct()
        this.reproduce()
        this.mutate()
    }

    public speciate() {
        const orphans = this.species.flatMap(species => species.reset())
        for (const individual of orphans) {
            if (individual.species !== null) continue
            this.assign_species(individual)
        }
        for (const species of this.species) {
            species.evaluate()
        }
    }

    public assign_species(individual: Body): SpeciesId {
        // Try to add the individual to an existing species
        for (const species of this.species) {
            if (species.add(individual)) {
                log(`Added individual to existing species ${species.id}, ${species.individuals.length} individuals`);
                return species.id;
            }
        }

        // If the individual couldn't be added to an existing species and we haven't reached the max species limit
        if (this.species.length < MAX_SPECIES) {
            const newSpecies = new Species(individual, this.evolution, this.genePool);
            this.species.push(newSpecies);
            log(`Created new species ${newSpecies.id}`);
            return newSpecies.id;
        }
        // If we have reached the max species limit, find the closest species and add the individual to it
        // TODO: instead, consider doing a progressive backoff of the speciation threshold in the species.add method
        let closestSpecies = this.species[Math.floor(Math.random() * this.species.length)];
        let closestDistance = Infinity;
        for (const species of this.species) {
            const distance = individual.distance(species.representative);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSpecies = species;
            }
        }

        closestSpecies._add(individual);
        log(`Added individual to closest species ${closestSpecies.id}, ${closestSpecies.individuals.length} individuals`);
        return closestSpecies.id;

    }

    public breed(parent_1: Body, parent_2: Body): Body {
        // find which individual has the higher score, make the parent with the best score "parent_1"
        if (parent_2.score > parent_1.score) {
            const temp = parent_1
            parent_1 = parent_2
            parent_2 = temp
        }
        const child_genome = this.evolution.crossover(parent_1.genome, parent_2.genome, this.genePool)
        return new Body(child_genome)
    }

    public cull() {
        for (const species of this.species) {
            species.kill(CULL_THRESHOLD)
        }
    }

    public remove_extinct() {
        for (let i = this.species.length - 1; i >= 0; i--) {
            if (this.species[i].individuals.length <= 1) {
                this.species[i].extinction()
                log(`Species ${i} has gone extinct`)
                this.species.splice(i, 1)
            }
        }
        log(`Remaining species: ${this.species.length}`)
    }

    /** Randomly select parents to mate */
    public reproduce() {
        const select_random = new RandomSelector<Species>()
        let births = 1
        for (const species of this.species) {
            select_random.add(species, species.score)
            births = species.individuals.length * BIRTH_RATE
        }
        while (births-- > 0) {
            const species = select_random.select()
            //randomly select parents
            const parent1 = species.getRandom()
            const parent2 = species.getRandom()
            // generating a genome 
            const child = this.breed(parent1, parent2)
            species._add(child)
        }
    }

    /** Mutates all individuals in the environment */
    public mutate() {
        for (const individual of this.individuals()) {
            this.evolution.mutate(individual.genome, this.genePool)
        }
    }
    /** Gets all individuals in the environment from the species. */
    public individuals(): Body[] {
        return this.species.flatMap(species => species.individuals)
    }

    public reset() {}


}