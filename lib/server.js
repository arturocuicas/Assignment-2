/*
 * Arturo Cuicas
 * 19/08/18
 * Index Server File
 */

'use strict'

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./config');
const router = require('./router');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

console.log(router)
// Instantiate the server module object
const server = {};

 // Instantiate the HTTP server
server.httpServer = http.createServer((req,res) => {
   server.unifiedServer(req,res);
});

// Init the Key Object
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
// Instantiate the HTTPS server
server.httpsServer = https.createServer(server.httpsServerOptions,(req,res) => {
  server.unifiedServer(req,res);
});

// All the server logic for both the http and https server
server.unifiedServer = (req,res) => {
  // Parse the url
  const parsed = url.parse(req.url, true);
  
  // Get the path
  const path = parsed.pathname;
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  
  // Get the query string as an object
  const queryString = parsed.query;

  // Get the HTTP method
  const method = req.method.toLowerCase();
  //Get the headers as an object
  const headers = req.headers;

  // Get the payload,if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', async () => {
    buffer += decoder.end();

    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    const chosen = typeof(router.routes[trimmed]) !== 'undefined' ? router.routes[trimmed] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      'trimmedPath': trimmed,
      'queryStringObject': queryString,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJSONToObject(buffer)
    };

    try {
      // Await the route requested by the handler specified in the router
      const received = await chosen(data);

      // Use the status code called back by the handler, or default to 200
      received.status = typeof(received.status) === 'number' ? received.status : 200;
  
      // Use the payload called back by the handler, or default to empty object
      received.payload = typeof(received.payload) === 'object' ? received.payload : {};
  
      // Convert the payload to a string
      const payloadString = JSON.stringify(received.payload);
  
      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(received.status);
      res.end(payloadString);
  
      // If the response is 200, print green otherwise print red
      if(received.status === 200) {
        console.log('\x1b[32m%s\x1b[0m', `${method.toUpperCase()}/${trimmed} ${received.status} + ${payloadString}`);
      } else {
        console.log('\x1b[31m%s\x1b[0m', `${method.toUpperCase()}/${trimmed} ${received.status} + ${payloadString}`);
      }
    } catch(e) {
      // Log any errors from chosen(), which calls the routers.routes to a handlers method
      console.log(e);
    }


  });
};

// Init script
server.init = () => {
 // Start the HTTP server
 server.httpServer.listen(config.httpPort,() => {
   console.log(`The HTTP server is running on port ${ config.httpPort }`);
 });

 // Start the HTTPS server
 server.httpsServer.listen(config.httpsPort,() => {
  console.log(`The HTTPS server is running on port ${ config.httpsPort }`);
 });
};

// Export the Module
module.exports = server;
