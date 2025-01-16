import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url';
import { Evolution } from './src/Evolution'
import { GenePool } from './src/GenePool'
import { TestEnvironment } from './src/testEnv'

const input_size = 3
const output_size = 2
const population_size = 100
const gene_pool = new GenePool()
const evolution = new Evolution(input_size, output_size, population_size, gene_pool)
const environment = new TestEnvironment(evolution, gene_pool)

evolution.reset(input_size, output_size, population_size, gene_pool)
environment.populate(population_size)
// console.table(environment.individuals().map(individual => ({ id: individual.id, species: individual.species })))

for (let i = 0; i < 100; i++)environment.step()

console.table(environment.individuals().map(individual => ({ id: individual.id, weights: individual.genome.connections.getAll().map(c => c.weight) })))