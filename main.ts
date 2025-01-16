import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url';
import { Evolution } from './src/Evolution'
import { GenePool } from './src/GenePool'
import { TestEnvironment } from './src/testEnv'

const input_size = 3
const output_size = 2
const population_size = 1000
const gene_pool = new GenePool()
const evolution = new Evolution(input_size, output_size, population_size, gene_pool)
const environment = new TestEnvironment(evolution, gene_pool)

evolution.reset(input_size, output_size, population_size, gene_pool)
environment.populate(population_size)
// console.table(environment.individuals().map(individual => ({ id: individual.id, species: individual.species })))

setInterval(() => environment.step(), 1000)

// console.table(environment.individuals().map(individual => ({ id: individual.id, weights: individual.genome.connections.getAll().map(c => c.weight) })))

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');

  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Bad Request' }));
    return
  }

  let urlParts = req.url ? req.url.split('?') : [];
  let path = urlParts[0] ? urlParts[0] : req.url;
  const speciesIndex = parseInt(parse(req.url, true).query.species as string);
  const individualIndex = parseInt(parse(req.url, true).query.individual as string);


  let genome;
  const species = environment.species[speciesIndex];
  if (species && species.individuals[individualIndex]) {
    genome = species.individuals[individualIndex].genome;
  }

  switch (path) {
    case '/':
      res.end(JSON.stringify(environment.species));
      break;
    case '/genome':
      res.end(JSON.stringify(genome));
      break;
    case '/mutateLink':
      if (!genome) break;
      evolution.mutate_link(genome, gene_pool);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateNode':
      if (!genome) break;
      evolution.mutate_node(genome, gene_pool);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateWeightShift':
      if (!genome) break;
      evolution.mutate_weight_shift(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateWeightRandom':
      if (!genome) break;
      evolution.mutate_weight_random(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateLinkToggle':
      if (!genome) break;
      evolution.mutate_link_toggle(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/stimulate':
      if (!species || !species.individuals[individualIndex]) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid species or individual index' }));
        break;
      }
      const individual = species.individuals[individualIndex];
      const randomInput = Array.from({ length: input_size }, () => Math.random());
      const output = individual.brain.think(randomInput);
      res.end(JSON.stringify(output));
      break;
    default:
      res.end(JSON.stringify({ message: 'Unknown endpoint' }));
      break;
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});


