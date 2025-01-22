import http from 'http';
import { Evolution } from "../Evolution";
import { GenePool } from "../GenePool";
import { Brain } from '../brain/Brain';
import { TestEnvironment } from '../environments/testEnv';

const input_size = 3;
const output_size = 2;
const inputs = [1, 1, 1];

const population_size = 100

const gene_pool = new GenePool();
const evolution = new Evolution(input_size, output_size, population_size, gene_pool);
const environment = new TestEnvironment(evolution, gene_pool);

evolution.reset(input_size, output_size, population_size, gene_pool);
environment.populate(population_size);

// take 100 steps
for (let i = 0; i < 100; i++)environment.step();

const genome = environment.species[0].individuals[0].genome;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  switch (req.url) {
    case '/':
      res.end(JSON.stringify(genome));
      break;
    case '/mutateLink':
      evolution.mutate_link(genome, gene_pool);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateNode':
      evolution.mutate_node(genome, gene_pool);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateWeightShift':
      evolution.mutate_weight_shift(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateWeightRandom':
      evolution.mutate_weight_random(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateLinkToggle':
      evolution.mutate_link_toggle(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/stimulate':
      // NTOE: we have to regenerate a new Brain every time the genome changes...
      const brain = new Brain(genome);
      const outputs = brain.think(inputs);
      res.end(JSON.stringify(outputs));
      break;
    case '/reset':
      evolution.reset(input_size, output_size, 100, gene_pool);
      for (let i = 0; i < 100; i++)environment.step();
      res.end(JSON.stringify(genome));
      break;
    default:
      res.end(JSON.stringify({ message: 'Unknown endpoint' }));
      break;
  }
});

server.listen(9000, () => {
  console.log('Server listening on port 9000');
});