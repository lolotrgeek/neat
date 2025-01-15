import { Body } from "./Body";
import { CULL_THRESHOLD } from "./config";
import { RandomSelector } from "./data_structures/random_selector";
import { Evolution } from "./Evolution";
import { GenePool } from "./GenePool";
import { Species } from "./Species";

export class Environment {
    public evolution: Evolution
    public genePool: GenePool
    public species: Species[] = []
    public individuals: Body[] = []

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
        // call reset on each species
        this.species.forEach(species => species.reset())

        for (const individual of this.individuals) {
            if (individual.species !== null) continue

            let found = false
            for (const species of this.species) {
                if (species.add(individual)) {
                    found = true
                    break
                }
            }
            if (!found) {
                const species = new Species(individual, this.evolution, this.genePool)
                this.species.push(species)
            }
        }
        for (const species of this.species) {
            species.evaluate()
        }

    }

    public cull() {
        for (const species of this.species) {
            species.kill(CULL_THRESHOLD)
        }
    }

    public remove_extinct() {
        for (let i = this.species.length - 1; i >= 0; i--) {
            if (this.species[i].individuals.size() <= 1) {
                this.species[i].extinction()
                console.log(`Species ${i} has gone extinct`)
                this.species.splice(i, 1)
            }
        }
    }

    public reproduce() {
        const select_random = new RandomSelector<Species>()
        for (const species of this.species) {
            select_random.add(species, species.score)
        }
        console.log(select_random)
        for (let individual of this.individuals) {
            if (individual.species === null) {
                const species = select_random.select()
                
                console.log(species)
                //randomly select parents
                const parent1 = species.individuals.getRandom()
                const parent2 = species.individuals.getRandom()
                // generating a genome 
                individual.genome = species.breed(parent1, parent2).genome
                species._add(individual)
            }
        }
    }
    /** Mutates all individuals in the environment */
    public mutate() {
        for (const individual of this.individuals) {
            this.evolution.mutate(individual.genome, this.genePool)
        }
    }
}