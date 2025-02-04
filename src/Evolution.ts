import { MUTATE_LINK_PERMUTATIONS, NODE_Y_OFFSET, PROABILITY_MUTATE_LINK, PROABILITY_MUTATE_NODE, PROABILITY_MUTATE_TOGGLE, PROABILITY_MUTATE_WEIGHT_RANDOM, PROABILITY_MUTATE_WEIGHT_SHIFT, WEIGHT_RANDOM_STRENGTH, WEIGHT_SHIFT_STRENGTH } from "./config";
import { ConnectionId, GenePool } from "./GenePool";
import { ActorGene } from "./genome/Actor";
import { ConnectionGene } from "./genome/Connection";
import { Genome } from "./genome/Genome";
import { NodeGene } from "./genome/Node";
import { SenseGene } from "./genome/Sense";

/**
 * Rules for evolving a population of genomes
 */
export class Evolution {
    public max_population_size: number = 0;

    public min_input_size: number = 1;
    public min_output_size: number = 1;

    public max_input_size: number = 3;
    public max_output_size: number = 3;

    public longest_input_size: number = 1;
    public longest_output_size: number = 1;

    constructor(population_size: number, gene_pool: GenePool) {
        this.reset(population_size, gene_pool);
    }

    /**
     * Creates a new genome with given inputs and outputs 
     * 
     * `NOTE:` must populate gene pool with nodes first! Call this.reset()
     * @param gene_pool 
     * @param inputs an array of input mappings to observables indicies
     * @param outputs an array of output mappings to observables indicies
     * @returns 
     */
    public new_genome(gene_pool: GenePool, inputs = [1,2,3], outputs = [1,2,3]): Genome {
        const genome = new Genome();
        if (inputs.length > this.longest_input_size) {
            this.longest_input_size = inputs.length
        }
        if (outputs.length > this.longest_output_size) {
            this.longest_output_size = outputs.length
        }

        for (let i = 0; i < inputs.length; i++) {
            genome.nodes.add(gene_pool.input_nodes[i]);
            let sense = new SenseGene()
            sense.frequency = inputs[i] 
            genome.senses.add(sense);
        }

        for (let i = 0; i < outputs.length; i++) {
            genome.nodes.add(gene_pool.output_nodes[i]);
            let actor = new ActorGene()
            actor.frequency = outputs[i]
            genome.actors.add(actor);
        }
        return genome;
    }

    /**
     * Create a child genome from two parent genomes
     * @param genome1 The first parent genome (fittest)
     * @param genome2 The second parent genome
     */
    public crossover(genome1: Genome, genome2: Genome, gene_pool: GenePool): Genome {
        const child = this.new_genome(gene_pool);
        let index_genome1 = 0
        let index_genome2 = 0

        while (index_genome1 < genome1.connections.size() && index_genome2 < genome2.connections.size()) {
            const connection1 = genome1.connections.get(index_genome1) as ConnectionGene
            const connection2 = genome2.connections.get(index_genome2) as ConnectionGene

            if (connection1.innovation_number < connection2.innovation_number) {
                child.connections.add(connection1);
                index_genome1++;
            } else if (connection1.innovation_number > connection2.innovation_number) {
                child.connections.add(connection2);
                index_genome2++;
            } else {
                if (Math.random() < 0.5) {
                    child.connections.add(connection1);
                } else {
                    child.connections.add(connection2);
                }
                index_genome1++;
                index_genome2++;
            }
        }

        while (index_genome1 < genome1.connections.size()) {
            const connection1 = genome1.connections.get(index_genome1) as ConnectionGene
            child.connections.add(connection1);
            index_genome1++;
        }

        while (index_genome2 < genome2.connections.size()) {
            const connection2 = genome2.connections.get(index_genome2) as ConnectionGene
            child.connections.add(connection2);
            index_genome2++;
        }

        // copy nodes
        const connections = child.getConnections();
        for (const connection of connections) {
            const node_1 = connection.from;
            const node_2 = connection.to
            if (node_1 && node_2) {
                child.nodes.add(node_1);
                child.nodes.add(node_2);
            }
        }

        // inherit senses and actors from fittest parent
        child.senses = genome1.senses;
        child.actors = genome1.actors

        return child;

    }

    public mutate(genome: Genome, gene_pool: GenePool): void {
        if (Math.random() < PROABILITY_MUTATE_LINK) {
            this.mutate_link(genome, gene_pool);
        }
        if (Math.random() < PROABILITY_MUTATE_NODE) {
            this.mutate_node(genome, gene_pool);
        }
        if (Math.random() < PROABILITY_MUTATE_WEIGHT_SHIFT) {
            this.mutate_weight_shift(genome);
        }
        if (Math.random() < PROABILITY_MUTATE_WEIGHT_RANDOM) {
            this.mutate_weight_random(genome);
        }
        if (Math.random() < PROABILITY_MUTATE_TOGGLE) {
            this.mutate_link_toggle(genome);
        }
    }

    /**
     * Add a new connection between two random nodes
     * @param genome 
     * @param gene_pool 
     * @returns 
     */
    public mutate_link(genome: Genome, gene_pool: GenePool): void {
        for (let i = 0; i < MUTATE_LINK_PERMUTATIONS; i++) {
            const node1 = genome.nodes.getRandom() as NodeGene
            const node2 = genome.nodes.getRandom() as NodeGene
            // NOTE: Skip if the nodes are in the same layer
            if (node1.x === node2.x) continue

            let connection: ConnectionGene | undefined

            if (node1.x < node2.x) {
                connection = new ConnectionGene(node1, node2)
            }
            else {
                connection = new ConnectionGene(node2, node1)
            }
            if (genome.connections.contains(connection)) continue

            connection.innovation_number = this.createConnection(node1, node2, gene_pool).innovation_number
            connection.weight = (Math.random() * 2 - 1) * WEIGHT_RANDOM_STRENGTH
            genome.connections.add_sorted(connection)
            return
        }
    }

    /**
     * Add a new node between two random nodes
     * @param genome 
     * @param gene_pool 
     * @returns 
     */
    public mutate_node(genome: Genome, gene_pool: GenePool): void {
        const connection = genome.connections.getRandom() as ConnectionGene
        if (!connection) return

        const from_node = connection.from
        const to_node = connection.to


        const existing_connection = gene_pool.getConnection(from_node, to_node)
        let middle_node: NodeGene | undefined

        if (existing_connection) {
            middle_node = this.getNode(existing_connection.replaceIndex, gene_pool)
        }

        if (!existing_connection || !middle_node) {
            middle_node = this.createNode(gene_pool)
            middle_node.x = (from_node.x + to_node.x) / 2
            middle_node.y = (from_node.y + to_node.y) / 2 + NODE_Y_OFFSET
            gene_pool.addConnection(gene_pool.getConnectionId(from_node, to_node), middle_node.innovation_number)
        }

        const new_connection1 = this.createConnection(from_node, middle_node, gene_pool)
        const new_connection2 = this.createConnection(middle_node, to_node, gene_pool)

        new_connection1.weight = 1
        new_connection2.weight = connection.weight
        new_connection2.enabled = connection.enabled

        genome.connections.remove(connection)
        // TODO: does this need to be sorted?
        genome.connections.add_sorted(new_connection1)
        genome.connections.add_sorted(new_connection2)

        genome.nodes.add(middle_node)

    }

    /**
     * Mutate by shifting the weight of a random connection
     * @param genome 
     */
    public mutate_weight_shift(genome: Genome): void {
        const connection = genome.connections.getRandom() as ConnectionGene
        if (connection) {
            connection.weight += (Math.random() * 2 - 1) * WEIGHT_SHIFT_STRENGTH
        }

    }

    /**
     * Mutate by setting the weight of a random connection to a random value
     * @param genome 
     */
    public mutate_weight_random(genome: Genome): void {
        const connection = genome.connections.getRandom() as ConnectionGene
        if (connection) {
            connection.weight = (Math.random() * 2 - 1) * WEIGHT_RANDOM_STRENGTH
        }
    }

    /**
     * Mutate by toggling the enabled state of a random connection
     * @param genome 
     */
    public mutate_link_toggle(genome: Genome): void {
        const connection = genome.connections.getRandom() as ConnectionGene
        if (connection) {
            connection.enabled = !connection.enabled
        }
    }

    /**
     * Reset evolution by clearing the gene pool and adding max input and output nodes to gene pool
     * @param population_size 
     * @param gene_pool
     * @returns
     * */
    public reset(population_size: number, gene_pool: GenePool): void {
        gene_pool.all_connections.clear();
        gene_pool.input_nodes = [];
        gene_pool.output_nodes = [];
        this.max_population_size = population_size;

        for (let i = 0; i < this.max_input_size; i++) {
            const new_input = this.createNode(gene_pool, "input");
            new_input.x = 0.1;
            new_input.y = (i + 1) / (this.max_input_size + 1);
        }

        for (let i = 0; i < this.max_output_size; i++) {
            const new_output = this.createNode(gene_pool, "output");
            new_output.x = 0.9;
            new_output.y = (i + 1) / (this.max_output_size + 1);
        }
    }

    /**
     * Create a new connection gene between two node genes, checking if the connection gene already exists in the gene pool
     * @param node_1 
     * @param node_2 
     * @param gene_pool 
     * @returns 
     */
    public createConnection(node_1: NodeGene, node_2: NodeGene, gene_pool: GenePool): ConnectionGene {
        const connection = new ConnectionGene(node_1, node_2);
        const connection_id = gene_pool.getConnectionId(node_1, node_2);
        const existing_connection = gene_pool.all_connections.get(connection_id);
        if (existing_connection) {
            connection.innovation_number = existing_connection.innovation_number
        } else {
            connection.innovation_number = gene_pool.all_connections.size + 1;
            gene_pool.addConnection(connection_id, connection.innovation_number);
        }
        return connection;
    }

    public createNode(gene_pool: GenePool, type="input"): NodeGene {
        const node = new NodeGene()
        node.innovation_number = gene_pool.allNodes().length + 1
        node.x = Math.random()
        node.y = Math.random()
        if(type === "input") gene_pool.addInputNode(node)
        if(type === "output") gene_pool.addOutputNode(node)
        return node;
    }

    public getNode(innovation_number: number, gene_pool: GenePool): NodeGene | undefined {
        return gene_pool.allNodes().find(node => node.innovation_number === innovation_number)
    }

}