import { Body } from "../body/Body";
import { Environment } from "../environment/Environment";
import { Lever } from "../environment/Lever";
import { Observable } from "../environment/Observable";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";

export type Levers = Array<(...args: any[]) => any>

export class ObservationEnvrionment extends Environment {
    public observables: Observable[] = []
    
    /** allows a gene to map to a lever ( a gene with expression 0, maps brain output0 to pull lever at 0 index) */
    public levers: Lever[] = []
    public population_size: number

    constructor(observables: Observable[], levers: Lever[]) { 
        const genePool = new GenePool()
        const population_size = 1000
        const evolution = new Evolution(observables.length, levers.length, population_size, genePool)
        super(evolution, genePool)
        this.population_size = population_size
        this.observables = observables
        this.levers = levers
    
    }

        public step() {
            // run each observation 
            for (let observable of this.observables) observable.observe()
            
            for (let individual of this.individuals()) {
                let inputs = individual.sensors.map(sensor => sensor.sense()) 
                let outputs = individual.brain.think(inputs)
                individual.actions.map((action, i) => this.levers[action.lever].act(outputs[i]))
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

        public reset() {
            this.evolution.reset(this.observables.length, this.levers.length, this.population_size, this.genePool)
        }


}