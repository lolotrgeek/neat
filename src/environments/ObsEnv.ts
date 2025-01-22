import { Body } from "../body/Body";
import { Environment } from "../environment/Environment";
import { Observable } from "../environment/Observable";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";

export class ObservationEnvrionment extends Environment {
    public observables: Observable[] = []
    public population_size: number
    public actions: any[] = []
    constructor(observables: Observable[]) { 
        const genePool = new GenePool()
        const actions = [1,2,3]
        const population_size = 1000
        const evolution = new Evolution(observables.length, actions.length, population_size, genePool)
        super(evolution, genePool)
        this.population_size = population_size
        this.observables = observables
        this.actions = actions
    
    }

        public step() {
            for (let individual of this.individuals()) {
                let observations = this.observables.map(o => o.observe())
                individual.brain.think(observations)
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
            this.evolution.reset(this.observables.length, this.actions.length, this.population_size, this.genePool)
        }


}