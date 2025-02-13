import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url';
import { Observable } from './src/environment/Observable';
import { Actionable } from './src/environment/Actionable';
import { EnergyEnvrionment } from './src/environments/EnergyEnv';

const buy = new Actionable()
const sell = new Actionable()
const send = new Actionable()
const mate = new Actionable()

const observables = Array.from({ length: 10 }, () => new Observable())
const actionables = [buy, sell, send, mate]
const actionableCosts = [100, 100, 100, 100]

const environment = new EnergyEnvrionment(observables, actionables)
environment.energy = 1_000_000
environment.reset()
environment.populate(environment.population_size)

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
      res.end(JSON.stringify(environment));
      break;
    case '/genome':
      res.end(JSON.stringify(genome));
      break;
    case '/mutateLink':
      if (!genome) break;
      environment.evolution.mutate_link(genome, environment.genePool);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateNode':
      if (!genome) break;
      environment.evolution.mutate_node(genome, environment.genePool);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateWeightShift':
      if (!genome) break;
      environment.evolution.mutate_weight_shift(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateWeightRandom':
      if (!genome) break;
      environment.evolution.mutate_weight_random(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/mutateLinkToggle':
      if (!genome) break;
      environment.evolution.mutate_link_toggle(genome);
      res.end(JSON.stringify(genome));
      break;
    case '/stimulate':
      if (!species || !species.individuals[individualIndex]) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid species or individual index' }));
        break;
      }
      const individual = species.individuals[individualIndex];
      const randomInput = Array.from({ length: individual.sensors.length }, () => Math.random());
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


