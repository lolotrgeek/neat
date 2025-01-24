import { Neuron } from "./Neuron";
import { Genome } from "../genome/Genome";
import { NodeGene } from "../genome/Node";
import { ConnectionGene } from "../genome/Connection";
import { InnovationNumber } from "../genome/Gene";
import { Synapse } from "./Synapse";

export class Brain {

    public nodes: NodeGene[];
    public connections: ConnectionGene[];

    public neuronMap: Map<number, Neuron>;

    public input_neurons: Neuron[] = []
    public hidden_neurons: Neuron[] = []
    public output_neurons: Neuron[] = []


    constructor(genome: Genome) {
        this.nodes = genome.getNodes();
        this.connections = genome.getConnections();

        this.neuronMap = new Map<InnovationNumber, Neuron>();

        for (let node of this.nodes) {
            const neuron = new Neuron(node.x, node.y);
            this.neuronMap.set(node.innovation_number, neuron);

            if (node.x <= 0.1) this.input_neurons.push(neuron);
            else if (node.x >= 0.9) this.output_neurons.push(neuron);
            else this.hidden_neurons.push(neuron);

        }

        this.hidden_neurons.sort((a, b) => a.compareTo(b));

        for (let connection of this.connections) {

            const from = connection.from
            const to = connection.to

            const neuron_from = this.neuronMap.get(from.innovation_number) as Neuron
            const neuron_to = this.neuronMap.get(to.innovation_number) as Neuron

            const synapse = new Synapse(neuron_from, neuron_to);
            synapse.weight = connection.weight;
            synapse.enabled = connection.enabled;

            neuron_to.connections.push(synapse);
        }
    }

    public think(inputs: number[]): number[] {
        if (inputs.length !== this.input_neurons.length) {
            throw new Error("Input length does not match input neurons length")
        }
        // Set the input neurons to the input values
        for (let i = 0; i < inputs.length; i++) {
            this.input_neurons[i].output = inputs[i];
        }

        for (let neuron of this.hidden_neurons) {
            neuron.stimulate();
        }

        for (let neuron of this.output_neurons) {
            neuron.stimulate();
        }

        return this.output_neurons.map(neuron => neuron.output);
    }

}