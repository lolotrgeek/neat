import { mergeDatasetAndFindMinMax, MinMaxIndex, NNdenormalize, NNnormalize, normalize } from "json-normalizer/js/src/normalizer";
import { Environment } from "../environment/Environment";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { NNDecode, NNEncode } from "json-normalizer";
import { randomUUID } from "crypto";
import { Pub, Sub } from "../utils/messaging";

export interface Vector {
    location: { x: number; y: number };
    name: string;
    /** Max distance messages from this vector can travel */
    range: number;
}

export class RandomGenerator {
    pub: Pub
    id: string
    location: { x: number; y: number }
    range: number = 15
    output: number[] = []
    keyVocabulary = {};
    stringVocabulary = {};
    minMaxIndex = { keys: { min: 0, max: 0 }, values: {} } as MinMaxIndex;
    types = {};

    constructor(id: string, location: { x: number; y: number }) {
        this.id = id
        this.location = location
        this.pub = new Pub(id)
    }

    public async start() {
        try {
            await this.pub.start()
            setInterval(() => {
                this.generateRandomData()
                this.pub.send({ output: this.output })
            }, 1000)

        } catch (error) {
            console.error(error)
        }
    }

    public encodeData(data: any) {
        const { encodings, stringVocabulary, keyVocabulary, minMaxIndex, types } = NNEncode(
            data,
            this.keyVocabulary,
            this.stringVocabulary,
            this.minMaxIndex
        );
        this.stringVocabulary = stringVocabulary;
        this.keyVocabulary = keyVocabulary;
        this.minMaxIndex = minMaxIndex;
        this.types = types;
        return encodings;
    }

    public generateRandomData() {
        const data = {
            id: Math.random().toString(36),
            name: `name${Math.random().toString(36)}`,
            value: Math.random() * 100,
            date: new Date().toISOString(),
        }
        const encoded = this.encodeData(data)
        const normal = NNnormalize(encoded, this.minMaxIndex, this.types);
        const vector = normal.flat();
        this.output = vector
    }

}

export class Creature extends RandomGenerator {
    public subs: Record<string, Sub> = {}
    public memory: number[] = []

    constructor(id: string, location: { x: number; y: number }) {
        super(id, location)
        this.range = 15
    }

    public async start() {
        try {
            await this.pub.start()
            setInterval(() => {
                this.pub.send({ output: this.output })
            }, 1000)

        } catch (error) {
            console.error(error)
        }

    }

    public async newSub(id: string) {
        const sub = new Sub(id)
        try {
            await sub.start()
            this.subs[id] = sub
            sub.on((message) => {
                if (message && message.output) {
                    const input = message.output as number[]
                    this.mutateInput(input)
                }
            })
        } catch (error) {
            console.error(error)
        }
    }

    public async removeSub(id: string) {
        if (id in this.subs) {
            await this.subs[id].end()
            delete this.subs[id]
        }
    }

    public mutateInput(input: number[]) {
        if (input.length > 0) {
            this.output = input.map(val => (val / input.length) + (Math.random() - 0.5) * 0.1);
        }
        else this.output = []
    }
}

export class randomEnv extends Environment {
    size = { x: 100, y: 100 };
    public generators: RandomGenerator[] = [];
    public creatures: Creature[] = [];
    public subs: Record<string, Sub> = {}

    constructor() {
        const genePool = new GenePool();
        const population_size = 100;
        const evolution = new Evolution(population_size, genePool);
        super(evolution, genePool);
    }

    /**
     * Generates a unique location in the environment. Ensures that the location is not already occupied.
     * @returns 
     */
    private generateUniqueLocation(): { x: number; y: number } {
        let location: { x: number; y: number };
        do {
            location = {
                x: Math.floor(Math.random() * this.size.x),
                y: Math.floor(Math.random() * this.size.y)
            };
        } while (this.generators.some(r => r.location.x === location.x && r.location.y === location.y));
        return location;
    }

    public async newRandomGenerator(name: string = randomUUID()) {
        const location = this.generateUniqueLocation();
        const generator = new RandomGenerator(name, location);
        await generator.start()
        this.generators.push(generator);
        console.log(`Registered new vector ${name} at location (${location.x}, ${location.y})`);
        // TODO: sub to the generator if we are spawning it in a new process
    }

    public generateRandomCreature() {
        const location = {
            x: Math.floor(Math.random() * this.size.x),
            y: Math.floor(Math.random() * this.size.y)
        };
        const name = randomUUID();
        const creature = new Creature(name, location)
        creature.start()
        this.creatures.push(creature)
        console.log(`Spawned new creature ${creature.id} at (${creature.location.x}, ${creature.location.y})`);
        // TODO: sub to the creature if we are spawning it in a new process
    }

    // Helper to clamp values.
    private clamp(val: number, min: number, max: number): number {
        return Math.min(Math.max(val, min), max);
    }

    // New method: updates one creature.
    private updateCreature(creature: Creature): void {
        // Move randomly: add a small delta from -1 to 1.
        creature.location.x = this.clamp(creature.location.x + Math.floor((Math.random() - 0.5) * 3), 0, this.size.x - 1);
        creature.location.y = this.clamp(creature.location.y + Math.floor((Math.random() - 0.5) * 3), 0, this.size.y - 1);

        this.generators.forEach(vec => {
            const dx = vec.location.x - creature.location.x;
            const dy = vec.location.y - creature.location.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= creature.range && !(vec.id in creature.subs)) {
                creature.newSub(vec.id)
            }
            else if (vec.id in creature.subs) {
                creature.removeSub(vec.id)

            }
        });

        this.creatures.forEach(otherCreature => {
            if (otherCreature.id !== creature.id) {
                const dx = otherCreature.location.x - creature.location.x;
                const dy = otherCreature.location.y - creature.location.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= creature.range && !(otherCreature.id in creature.subs)) {
                    creature.newSub(otherCreature.id)
                }
                else if (otherCreature.id in creature.subs) {
                    creature.removeSub(otherCreature.id)
                }
            }
        });
    }

    /**
     * Simulates a data stream by generating new random data and vectorizing it,
     * then updating any already-registered vectors with the new vector (keeping their original location and name),
     * and updating creatures which move and process nearby vectors.
     */
    public async step() {
        try {
            // Update registered vectors.
            if (this.generators.length < 5) {
                this.newRandomGenerator();
            }
            // Update creatures.
            if (this.creatures.length < 5) {
                // Spawn new creature if fewer than 5 exist.
                this.generateRandomCreature();
            } else {
                // Update each creature: move and update vector based on nearby inputs.
                this.creatures.forEach(creature => {
                    this.updateCreature(creature);
                    console.log(`Updated creature ${creature.id}: location (${creature.location.x}, ${creature.location.y})`);
                });
            }

        } catch (error) {
            console.error(error)
        }
    }
}