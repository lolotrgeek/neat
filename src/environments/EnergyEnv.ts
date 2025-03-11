import { Body } from "../body/Body";
import { Environment } from "../environment/Environment";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { randomNormal } from "../utils/randomNormal";
import { selectRandomIndices } from "../utils/randomIndicies";
import { robustNormalize } from "../utils/robustNormalize";

// export type Levers = Array<(...args: any[]) => any>
interface Actionable {
    act: (...args: any[]) => void;
    /** the minimum should be 1, even if there are no actual inputs to the action */
    argCount: number;
}

interface Observable {
    observe: (...args: any[]) => any;
    outputCout: number;
}

export class EnergyEnvrionment extends Environment {
    public actionables: Actionable[] = []
    public observables: Observable[] = []
    public locations: string[] = []
    public population_size: number
    public population: number = 0
    public energy: number = 0
    public transactionMin: number = 0;
    public transactionMax: number = 100;

    constructor() {
        const genePool = new GenePool()
        const population_size = 100
        const evolution = new Evolution(population_size, genePool)
        super(evolution, genePool)
        this.population_size = population_size

        this.locations = []

        this.actionables = [
            { act: this.transact, argCount: 2 },
            { act: this.mate, argCount: 1 },
            { act: this.move, argCount: 2 }
        ];
        this.observables = [
            { observe: this.individuals, outputCout: population_size }
        ]

        this.evolution.max_input_size = this.observables.map(o => o.outputCout).reduce((a, b) => a + b, 0)
        this.evolution.min_input_size = 1
        this.evolution.max_output_size = this.actionables.map(a => a.argCount).reduce((a, b) => a + b, 0)

    }

    public step() {
        for (let species of this.species) {
            this.population += species.individuals.length
            for (let i = 0; i < species.individuals.length; i++) {
                let individual = species.individuals[i]

                // let inputs = individual.sensors.map((observable, i) => this.observables[i].observe() )
                let inputs = individual.brain.input_neurons.map((neuron, i) => {
                    let observable = this.observables[i]
                    let args = outputs.slice(i, i + observable.outputCout) // NOTE: this may lead to partial observations ( we want to test this)
                    if (args.length < observable.outputCout) {
                        args = args.concat(Array(observable.outputCout - args.length).fill(0))
                    }
                    return observable.observe(...args)  
                })

                let outputs = individual.brain.think(inputs)

                let actions = outputs.map((output, i) => {
                    // TODO: map each output to an actionable, and invoke the actionable with the rest of output as the input
                    // need to check if the length of the output is less then or greater than the argCount of the actionable
                    // if less, then pad with zeros
                    // if greater, then truncate
                    // if equal, then use as is
                    let actionable = this.actionables[i]
                    let args = outputs.slice(i, i + actionable.argCount)
                    if (args.length < actionable.argCount) {
                        args = args.concat(Array(actionable.argCount - args.length).fill(0))
                    }
                    return actionable.act(...args)  
                })
                // individual.actions.map((action, i) => this.actionables[action.actionable].act(outputs[i]))
                individual.score = individual.energy
                // console.log(individual.genome.getConnections().map(c => c.innovation_number).join(' '))
                if (individual.energy < 0.01) {
                    console.log(`Culling individual with score ${individual.energy}`)
                    const speciesIndex = this.species.findIndex(species => species.id === individual.species)
                    if (speciesIndex > -1) {
                        let individual_energy = this.species[speciesIndex].individuals[i].energy
                        this.energy += individual_energy
                        this.species[speciesIndex].individuals[i].energy = 0
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

    /**
     * Transacts energy from one individual to another.
     * @param to - The raw output value from the neuron for selecting an individual.
     * @param amountIn - The raw output value indicating the amountIn in the transaction.
     */
    public transact(to: number, amountIn: number) {
        // Normalize the outputs robustly.
        const normalizedTo = robustNormalize(to, this.evolution.max_input_size, this.evolution.max_output_size);
        const normalizedAmountIn = robustNormalize(amountIn, this.evolution.min_output_size, this.evolution.max_output_size);
        const individuals = this.individuals().map(i => i.id)

        // Map the normalized 'to' value to an index in the individuals array.
        const index = Math.min(
            individuals.length - 1,
            Math.max(0, Math.floor(normalizedTo * individuals.length))
        );

        // Map the normalized amountIn to the transaction range.
        const amountOut = normalizedAmountIn * (this.transactionMax - this.transactionMin) + this.transactionMin;
        const individualId = individuals[index];

        console.log(`Transacting ${amountOut} to individual ${individualId}`);
        // TODO: invoke SOLkit send here, perform the transaction, on success, update the individual's energy.

        return { amountOut, individualId };
    }

    public mate(input: number) {
        console.log(`Mate action invoked with input: ${input}`);
    }

    public move(direction: number, velocity: number) {
        // Normalize the raw inputs into [0, 1]
        const normalizedDir = robustNormalize(direction, this.evolution.min_output_size, this.evolution.max_output_size);
        const normalizedVel = robustNormalize(velocity, this.evolution.min_output_size, this.evolution.max_output_size);

        // Convert normalized direction to an angle in radians (0 to 2π)
        const angle = normalizedDir * 2 * Math.PI;

        // Define a maximum speed for scaling the normalized velocity.
        const maxSpeed = 10; // This value can be adjusted according to the environment scale
        const speed = normalizedVel * maxSpeed;

        // Compute the displacement in the x and y directions.
        const dx = speed * Math.cos(angle);
        const dy = speed * Math.sin(angle);

        // For demonstration: log the computed movement details.
        console.log(`Moving with:
              angle: ${(angle * 180 / Math.PI).toFixed(2)}°,
              speed: ${speed.toFixed(2)},
              displacement: dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)}`);

        return { dx, dy };
    }

    public nearby(individual: Body) {
        
    }

    public populate(amount?: number) {
        if (!amount) amount = this.population_size
        for (let i = 0; i < amount; i++) {
            this.spawn()
        }
    }

    public spawn() {
        const maxInputs = this.evolution.max_input_size
        const maxOutputs = this.evolution.max_output_size


        let inputsVal = Math.round(randomNormal(maxInputs / 2, maxInputs / 6));
        let inputsCount = Math.min(maxInputs, Math.max(1, inputsVal));

        let outputsVal = Math.round(randomNormal(maxOutputs / 2, maxOutputs / 6));
        let outputsCount = Math.min(maxOutputs, Math.max(1, outputsVal));

        let inputs = selectRandomIndices(maxInputs, inputsCount);
        let outputs = selectRandomIndices(maxOutputs, outputsCount);

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