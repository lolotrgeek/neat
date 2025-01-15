import { InnonationNumber } from "./genome/Gene";
import { NodeGene } from "./genome/Node";

/** Represents a connection between nodes. `ex: 5 is connected to 4, ConnectionId = 5_4`  */
export type ConnectionId = string

/**
 * A GenePool is a collection of all the genes in the environment. This is used to keep track of all the genes in the environment.
 */
export class GenePool {
    /** A map of all connections across the entire environment */
    public all_connections: Map<ConnectionId, InnonationNumber> = new Map();
    /** A map of all nodes. Is this necessary? If we are going to put nodes in a Brain Object? */
    public all_nodes: Array<NodeGene> = [];
}

