import { Body } from "../body/Body";
import { Environment } from "../environment/Environment";
import { Actionable } from "../environment/Actionable";
import { Observable } from "../environment/Observable";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { Sensor } from "../body/Sensor";
import { Action } from "../body/Action";

// export type Levers = Array<(...args: any[]) => any>

export class ObservationEnvrionment extends Environment {
    public observables: Observable[] = []
    
    /** allows a gene to map to an actionable ( a gene with expression 0, maps brain output0 for actionable at 0 index) */
    public actionables: Actionable[] = []
    public population_size: number

    constructor(observables: Observable[], actionables: Actionable[]) { 
        const genePool = new GenePool()
        const population_size = 1000
        const evolution = new Evolution(population_size, genePool)
        super(evolution, genePool)
        this.population_size = population_size
        this.evolution.max_input_size = observables.length
        this.evolution.max_output_size = actionables.length
        this.observables = observables
        this.actionables = actionables
    }

        public step() {
            // run each observation 
            for (let observable of this.observables) observable.observe()
            
            for (let individual of this.individuals()) {
                let inputs = individual.sensors.map(sensor => sensor.sense(Math.random())) 
                let outputs = individual.brain.think(inputs)
                individual.actions.map((action, i) => this.actionables[action.actionable].act(outputs[i]))
                individual.score = this.randomScore()
                // console.log(individual.genome.getConnections().map(c => c.innovation_number).join(' '))
            }
            super.step()
        }
    
        public populate(amount?: number) {
            if(!amount) amount = this.population_size
            for (let i = 0; i < amount; i++) {
                this.spawn()
            }
        }
    
        public spawn() {
            let inputs = Math.floor(Math.random() * this.observables.length) + 1
            let outputs = Math.floor(Math.random() * this.actionables.length) + 1
            let genome = this.evolution.new_genome(this.genePool, inputs, outputs)
            let body = new Body(genome)
            body.sensors = Array.from({ length: inputs }, (_, i) => new Sensor())
            body.actions = Array.from({ length: outputs }, (_, i) => new Action())
            // call mutate_link between 10 and 20 times
            for (let i = 0; i < Math.floor(Math.random() * 10) + 10; i++) this.evolution.mutate_link(genome, this.genePool)
            this.assign_species(body)
            // console.table(body.genome.connections.getAll().map(c => ({ in: c.innovation_number, weight: c.weight })))
        }
    
        public randomScore() {
            return Math.random()
        }

        public reset() {
            this.evolution.reset(this.population_size, this.genePool)
        }


}