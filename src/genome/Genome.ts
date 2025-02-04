import { DISJOINT_IMPORTANCE, EXCESS_IMPORTANCE, WEIGHT_DIFFERENCE_IMPORTANCE } from "../config";
import { ActorGene } from "./Actor";
import { ConnectionGene } from "./Connection";
import { GeneStore } from "./Gene";
import { NodeGene } from "./Node";
import { SenseGene } from "./Sense";

/**
 * A Genome is a collection of genes with instructions to spawn a Body with inputs (senses), outputs (actors), & brain (neural network)
 */
export class Genome {
    public connections = new GeneStore();
    public nodes = new GeneStore();
    public senses = new GeneStore();
    public actors = new GeneStore();

    constructor() { }

    /**
     * Calculate the distance between this genome and another genome
     * @param genome2 The genome to compare this one to
     */
    public distance(genome2: Genome): number {
        let genome1 = this as Genome

        // Make sure genome1 has the highest innovation number
        let highest_innovation_number_gene1 = 0
        let highest_innovation_number_gene2 = 0

        if(genome1.connections.size() > 0) highest_innovation_number_gene1 = genome1.connections.get(genome1.connections.size() - 1).innovation_number
        if(genome2.connections.size() > 0) highest_innovation_number_gene2 = genome2.connections.get(genome2.connections.size() - 1).innovation_number

        if (highest_innovation_number_gene1 < highest_innovation_number_gene2) {
            const temp = genome1
            genome1 = genome2
            genome2 = temp
        }

        let index_genome1 = 0
        let index_genome2 = 0

        let disjoint = 0
        let excess = 0
        let weight_difference = 0
        let matching = 0

        while (index_genome1 < genome1.connections.size() && index_genome2 < genome2.connections.size()) {
            const connection1 = genome1.connections.get(index_genome1) as ConnectionGene
            const connection2 = genome2.connections.get(index_genome2) as ConnectionGene

            if (connection1.innovation_number < connection2.innovation_number) {
                // The connection is not present in the  genome (disjoint)
                disjoint++
                index_genome1++
            } else if (connection1.innovation_number > connection2.innovation_number) {
                // The connection is present in the genome2 genome (disjoint)
                disjoint++
                index_genome2++
            } else {
                // The connection is present in both genomes
                matching++
                weight_difference += Math.abs(connection1.weight - connection2.weight)
                index_genome1++
                index_genome2++
            }
        }

        weight_difference /= matching
        excess = genome1.connections.size() - index_genome1

        let normalized_genome_size = 0
        if (genome2.connections.size() < 20 && genome1.connections.size() < 20) normalized_genome_size = 1
        normalized_genome_size = Math.max(genome1.connections.size(), genome2.connections.size())

        const distance = EXCESS_IMPORTANCE * excess / normalized_genome_size + DISJOINT_IMPORTANCE * disjoint / normalized_genome_size + WEIGHT_DIFFERENCE_IMPORTANCE * weight_difference
        return distance

    }

    public getNodes(): NodeGene[] {
        return this.nodes.getAll()
    }

    public getConnections(): ConnectionGene[] {
        return this.connections.getAll()
    }

}