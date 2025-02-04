import { Body } from "../body/Body";
import { Environment } from "../environment/Environment";
import { Actionable } from "../environment/Actionable";
import { Observable } from "../environment/Observable";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { randomNormal } from "../utils/randomNormal";
import { selectRandomIndices } from "../utils/randomIndicies";

// export type Levers = Array<(...args: any[]) => any>

export class EnergyEnvrionment extends Environment {
    public observables: Observable[] = []

    /** allows a gene to map to an actionable ( a gene with expression 0, maps brain output0 for actionable at 0 index) */
    public actionables: Actionable[] = []
    public population_size: number
    public population: number = 0

    public energy: number = 0

    constructor(observables: Observable[], actionables: Actionable[]) {
        const genePool = new GenePool()
        const population_size = 100
        const evolution = new Evolution(population_size, genePool)
        super(evolution, genePool)
        this.population_size = population_size
        this.evolution.max_input_size = observables.length
        this.evolution.max_output_size = actionables.length
        this.observables = observables
        this.actionables = actionables
    }

    public step() {
        for (let observable of this.observables) observable.observe()
        for (let species of this.species) {
            this.population += species.individuals.length
            for (let i = 0; i < species.individuals.length; i++) {
                let individual = species.individuals[i]
                // let inputs = individual.sensors.map((observable, i) => this.observables[i].observe() )
                let inputs = individual.brain.input_neurons.map((neuron, n) => this.observables[n].observe())

                let outputs = individual.brain.think(inputs)

                let actions = outputs.map((output, i) => this.actionables[i].act(output))
                // individual.actions.map((action, i) => this.actionables[action.actionable].act(outputs[i]))
                individual.score = this.randomScore()
                // console.log(individual.genome.getConnections().map(c => c.innovation_number).join(' '))
                if (individual.score < 0.01) {
                    console.log(`Culling individual with score ${individual.score}`)
                    const speciesIndex = this.species.findIndex(species => species.id === individual.species)
                    if (speciesIndex > -1) {
                        this.species[speciesIndex].individuals.splice(i, 1)
                        if (this.species[speciesIndex].individuals.length === 0) {
                            this.species.splice(speciesIndex, 1) // extinction
                        }
                    }
                }
            }
        }
        super.step()
        console.log(this.population)
        this.population = 0
    }

    public populate(amount?: number) {
        if (!amount) amount = this.population_size
        for (let i = 0; i < amount; i++) {
            this.spawn()
        }
    }

    public spawn() {

        let inputsVal = Math.round(randomNormal(this.observables.length / 2, this.observables.length / 6));
        let inputsCount = Math.min(this.observables.length, Math.max(1, inputsVal));
    
        let outputsVal = Math.round(randomNormal(this.actionables.length / 2, this.actionables.length / 6));
        let outputsCount = Math.min(this.actionables.length, Math.max(1, outputsVal));
    
        let inputs = selectRandomIndices(this.observables.length, inputsCount);
        let outputs = selectRandomIndices(this.actionables.length, outputsCount);

        let genome = this.evolution.new_genome(this.genePool, inputs, outputs)
        let body = new Body(genome)
        const randomEnergy = Math.floor(Math.random() * this.energy);
        body.energy = randomEnergy;
        // console.log(`Spawned body with ${inputs} inputs and ${outputs} outputs`)
        // call mutate_link between 10 and 20 times
        for (let i = 0; i < Math.floor(Math.random() * 10) + 10; i++) this.evolution.mutate_link(genome, this.genePool)
        this.assign_species(body)
        console.log(`Spawned body with ${body.brain.input_neurons.length} inputs and ${body.brain.output_neurons.length} outputs`)
        // console.table(body.genome.connections.getAll().map(c => ({ in: c.innovation_number, weight: c.weight })))
    }

    public cull(): void { }

    public randomScore() {
        return Math.random()
    }

    public reset() {
        this.evolution.reset(this.population_size, this.genePool)
    }

    
}