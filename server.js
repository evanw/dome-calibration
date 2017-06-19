function getLanAddress() {
  const ifaces = require('os').networkInterfaces();

  for (const ifname in ifaces) {
    for (const iface of ifaces[ifname]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return null;
}

const http = require('http');
const fs = require('fs');
const ws = require('ws');

const server = http.createServer((request, response) => {
  const {method, url} = request;
  console.log(method, url);

  if (method === 'GET' && url === '/') {
    response.setHeader('Content-Type', 'text/html');
    response.end(fs.readFileSync('client.html', 'utf8'));
  }

  else if (method === 'POST' && url === '/') {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => {
      const data = Buffer.concat(chunks).toString();
      for (const client of wss.clients) {
        if (client.readyState === ws.OPEN) {
          try {
            client.send(data);
          } catch (e) {
          }
        }
      }
      response.end();
    });
  }

  else {
    response.statusCode = 404;
    response.end('404 Not Found');
  }
});

const wss = new ws.Server({server});
const port = 8000;

server.listen(port);
console.log(`Listening on http://${getLanAddress()}:${port}/`);
