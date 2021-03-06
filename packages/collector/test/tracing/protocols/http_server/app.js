/* eslint-disable no-console */

'use strict';

require('../../../../')();

const logPrefix = `HTTP: Server (${process.pid}):\t`;

const http = require('http');
const url = require('url');

const port = process.env.APP_PORT || 3000;
const app = new http.Server();

app.on('request', (req, res) => {
  if (process.env.WITH_STDOUT) {
    log(`${req.method} ${req.url}`);
  }
  const query = url.parse(req.url, true).query || {};

  if (req.url === '/dont-respond') {
    // Deliberately not sending a response in time so that the request times out client side. This will lead to the
    // following events to be emitted (in that order):
    // - req#aborted
    // - res#close
    setTimeout(() => {
      res.end();
    }, 4000);
    return;
  } else if (req.url === '/destroy-socket') {
    // Deliberately destroying the connection (that is, the underlying socket) server side. This will lead to the
    // following events to be emitted (in that order):
    // - req#aborted
    // - res#close
    req.destroy();
    return;
  }

  if (query.responseStatus) {
    res.statusCode = parseInt(query.responseStatus || 200, 10);
  }

  const delay = parseInt(query.delay || 0, 10);

  if (query.responseHeader) {
    res.setHeader('X-MY-FANCY-RESPONSE-HEADER', 'Response Header Value');
  }

  if (delay === 0) {
    endResponse(query, res);
  } else {
    setTimeout(() => {
      endResponse(query, res);
    }, delay);
  }
});

function endResponse(query, res) {
  if (query.writeHead) {
    res.writeHead(200, {
      'X-WRITE-HEAD-RESPONSE-HEADER': 'Write Head Response Header Value'
    });
  }

  // Regularly ending the response will emit the following events:
  // - res#finish
  // - res#close
  res.end();
}

app.listen(port, () => {
  log(`Listening on port: ${port}`);
});

function log() {
  const args = Array.prototype.slice.call(arguments);
  args[0] = logPrefix + args[0];
  console.log.apply(console, args);
}
