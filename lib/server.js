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
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');


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
  let parsedUrl = url.parse(req.url, true);

  // Get the path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  let queryStringObject = parsedUrl.query;

  // Get the HTTP method
  let method = req.method.toLowerCase();

  //Get the headers as an object
  let headers = req.headers;

  // Get the payload,if any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode,payload) => {

      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      //console.log(trimmedPath,statusCode);
    });
  });
};

// Define the request router
server.router = {
  'ping' : handlers.ping,
  'hello' : handlers.hello,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks,
  'menu' : handlers.menus,
  'cart' : handlers.cart
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
