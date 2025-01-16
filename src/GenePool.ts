import { InnonationNumber } from "./genome/Gene";
import { NodeGene } from "./genome/Node";

/** Represents a connection between nodes. `ex: 5 is connected to 4, ConnectionId = 5_4`  */
export type ConnectionId = string

export interface Connection {
    innovation_number: InnonationNumber
    /** If this connection has been replaced, this is the innovation number for the node in the middle. */
    replaceIndex: number // TODO: name this better
}

/**
 * A GenePool is a collection of all the genes in the environment. This is used to keep track of all the genes in the environment.
 */
export class GenePool {
    /** A map of all connections across the entire environment */
    public all_connections: Map<ConnectionId, Connection> = new Map();
    /** A map of all nodes. Is this necessary? If we are going to put nodes in a Brain Object? */
    public all_nodes: Array<NodeGene> = [];

    public getConnectionId(from: NodeGene, to: NodeGene): ConnectionId {
        return `${from.innovation_number}_${to.innovation_number}`;
    }

    public hasReplacementIndex(from:NodeGene, to: NodeGene): boolean {
        return this.all_connections.has(this.getConnectionId(from, to));
    }

    public getConnection(from: NodeGene, to: NodeGene): Connection | undefined {
        return this.all_connections.get(this.getConnectionId(from, to));
    }

    public addConnection(connection_id: ConnectionId, innovation_number: InnonationNumber, replaceIndex: number = -1) {
        this.all_connections.set(connection_id, { innovation_number, replaceIndex });
    }
}

