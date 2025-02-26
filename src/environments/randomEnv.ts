import { mergeDatasetAndFindMinMax, MinMaxIndex, NNdenormalize, NNnormalize, normalize } from "json-normalizer/js/src/normalizer";
import { Environment } from "../environment/Environment";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { NNDecode, NNEncode } from "json-normalizer"
import { randomUUID } from "crypto";


export interface Vector {
    /** Vectorized Data */
    vector: number[];
    location: { x: number; y: number };
    name: string;
    /** Max distance messages from this vector can travel */
    range: number;
}

export class randomEnv extends Environment {

    keyVocabulary = {}
    stringVocabulary = {}
    minMaxIndex = { keys: { min: 0, max: 0 }, values: {} } as MinMaxIndex;
    types = {}
    size = { x: 100, y: 100 }
    public registeredVectors: Vector[] = [];

    constructor() {
        const genePool = new GenePool()
        const population_size = 100
        const evolution = new Evolution(population_size, genePool)
        super(evolution, genePool);
    }

    public generateRandomData() {
        const data = {
            id: Math.random().toString(36),
            name: `name${Math.random().toString(36)}`,
            value: Math.random() * 100,
            date: new Date().toISOString(),
        };
        return data;
    }

    public encodeData(data: any) {
        const { encodings, stringVocabulary, keyVocabulary, minMaxIndex, types } = NNEncode(data, this.keyVocabulary, this.stringVocabulary, this.minMaxIndex);
        this.stringVocabulary = stringVocabulary;
        this.keyVocabulary = keyVocabulary;
        this.minMaxIndex = minMaxIndex
        this.types = types;
        return encodings;
    }

    /**
     * Vectorizes the data and registers it with a unique location in the environment.
     * @param data 
     * @returns 
     */
    public spacialVectorize(data: any, name: string = randomUUID()) {
        const encoded = this.encodeData(data);
        const normal = NNnormalize(encoded, this.minMaxIndex, this.types);
        const vector = normal.flat();
        const range = 10;

        // Register this vector with a unique location in the environment.
        const location = this.generateUniqueLocation();
        this.registeredVectors.push({ name, vector, location, range });
        console.log(`Registered vector at location (${location.x}, ${location.y})`);

        return { vector, location, name };
    }

    /**
     * Generates a unique location in the environment. Ensures that the location is not already occupied by another vector.
     * @returns 
     */
    private generateUniqueLocation(): { x: number; y: number } {
        let location: { x: number; y: number };
        do {
            location = {
                x: Math.floor(Math.random() * this.size.x),
                y: Math.floor(Math.random() * this.size.y)
            };
        } while (this.registeredVectors.some(r => r.location.x === location.x && r.location.y === location.y));
        return location;
    }

    public generateRandomVector(new_name: string = randomUUID()) {
        const data = this.generateRandomData();
        const { vector, location, name } = this.spacialVectorize(data, new_name);
        return { vector, location, name };
    }

    /**
      * Simulates a data stream by generating new random data and vectorizing it,
      * then updating any already-registered vectors with the new vector,
      * while keeping their original location and name.
      */
    public async step() {
        // If there are no registered vectors yet, create one.
        if (this.registeredVectors.length === 0) {
            const { vector, location, name } = this.generateRandomVector();
            console.log(`Registered new vector ${name} at location (${location.x}, ${location.y})`);
        } else {
            // For each registered vector, generate new random data,
            // vectorize it, and update the vector while preserving its location and name.
            this.registeredVectors = this.registeredVectors.map(regVector => {
                const data = this.generateRandomData();
                const encoded = this.encodeData(data);
                const normal = NNnormalize(encoded, this.minMaxIndex, this.types);
                const newVector = normal.flat();
                console.log(`Updated vector ${regVector.name} at location (${regVector.location.x}, ${regVector.location.y})`);
                return {
                    ...regVector,
                    vector: newVector,
                };
            });
        }
    }
}