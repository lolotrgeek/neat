import { mergeDatasetAndFindMinMax, MinMaxIndex, NNnormalize, normalize } from "json-normalizer/js/src/normalizer";
import { Environment } from "../environment/Environment";
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { NNEncode } from "json-normalizer"

export class SpaceEnv extends Environment {

    keyVocabulary = {}
    stringVocabulary = {}
    minMaxIndex = {keys: {min: 0, max: 0}, values: {}} as MinMaxIndex;
    types = {}

    constructor() {
        const genePool = new GenePool()
        const population_size = 100
        const evolution = new Evolution(population_size, genePool)
        super(evolution, genePool);
    }

    public async whaleFetch() {
        const response = await fetch('http://localhost:60000/consolidated')
        if (!response.ok) {
            throw new Error('Failed to retrieve transactions');
        }
        const data = await response.json();
        if (!data) return [];
        return data;
    }

    public whaleEncode(data: any[]) {
        return data.map(obj => {
            const {encodings, stringVocabulary, keyVocabulary, minMaxIndex, types} = NNEncode(obj);
            this.stringVocabulary = stringVocabulary;
            this.keyVocabulary = keyVocabulary;
            this.minMaxIndex = minMaxIndex
            this.types = types;
            return encodings;
        });
    }   

    public async step() {
        
        const data = await this.whaleFetch();
        const encoded = this.whaleEncode(data);
        const vector = encoded.map(obj => {
            const normal = NNnormalize(obj, this.minMaxIndex, this.types)
            // flatten the normal array
            return normal.flat();
            
        });
        //return the vector
        console.log(vector[0]);
        console.log(vector[0].length);
        return vector;
        

    }
}