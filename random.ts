import { createServer, IncomingMessage, ServerResponse } from 'http'
import { randomEnv } from "./src/environments/randomEnv";

const environment = new randomEnv()
environment.reset()
environment.step()
setInterval(() => environment.step(), 1000)

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');

  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Bad Request' }));
    return
  }

  let urlParts = req.url ? req.url.split('?') : [];
  let path = urlParts[0] ? urlParts[0] : req.url;


  switch (path) {
    case '/':
      res.end(JSON.stringify(environment));
      break;
    case '/creatures':
      res.end(JSON.stringify(environment.creatures));
      break;
    default:
      res.end(JSON.stringify({ message: 'Unknown endpoint' }));
      break;
  }
});

server.listen(3700, () => {
  console.log('Server running on port 3700');
});


