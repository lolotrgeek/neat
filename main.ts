import http from 'http';
import { Evolution } from "./src/Evolution";
import { GenePool } from "./src/GenePool";
import { Brain } from './src/brain/Brain';
import { Species } from './src/Species';
import { Body } from './src/Body';
import { Environment } from './src/Environment';
import { TestEnvironment } from './src/testEnv';

const input_size = 3;
const output_size = 2;
const inputs = [1, 1, 1];

const gene_pool = new GenePool();
const evolution = new Evolution(input_size, output_size, 100, gene_pool);
const environment = new TestEnvironment(evolution, gene_pool);

let genome = evolution.new_genome(gene_pool);

evolution.reset(input_size, output_size, 100, gene_pool);
environment.populate();
environment.step();

console.log(environment.species)

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
      genome = evolution.new_genome(gene_pool)
      res.end(JSON.stringify(genome));
      break;
    default:
      res.end(JSON.stringify({ message: 'Unknown endpoint' }));
      break;
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});