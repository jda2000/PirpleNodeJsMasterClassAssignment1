/*
 *
 *  Primary file for the API
 *
 */

// Dependancies

const http   = require('http');
const https  = require('https');
const url    = require('url');
const fs     = require('fs');
const config = require('./config');
const StringDecoder = require('string_decoder').StringDecoder;

// Debug level 0 => nothing, 1+ => existing console log calls won't be skipped

var debugLevel = config.debugLevel;

if (debugLevel > 0) {
    console.log("\nHello World!\n");
}

// Common server logic shared by http and https servers

const CommonServerLogic = function(request, response){

  // Get the URL and parse it.

  const parsedUrl = url.parse(request.url, true);  // true means parse the query string too.

  // Get the path from the request URL

  const pathFromUrl = parsedUrl.pathname;
  const trimmedPath = pathFromUrl.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object

  const queryStringObject = parsedUrl.query;

  // Get the HTTP Method

  const method = request.method.toUpperCase();

  // Get the headers as an Object

  const headers = request.headers;

  // Get the payload, if any

  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  request.on('data', function(data){
    buffer += decoder.write(data);
  });

  request.on('end', function(){
    buffer += decoder.end();

    // Log the request path

    if (debugLevel > 0) {
      console.log("----------------------------------------------------------------------------------------");
      console.log("Received a request for the path '" + trimmedPath + "' using the '" + method + "' method.");
      if ((typeof(queryStringObject) == 'undefined')
      ||  (typeof(queryStringObject) == 'object' && Object.keys(queryStringObject).length == 0)) {
        console.log("    There were no query string values.");
      } else {
        console.log("    the query string was " + JSON.stringify(queryStringObject));
      }
      console.log("    The headers were: \n" , headers);
      if (buffer != '') {
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log("    The payload was: \n" , buffer);
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      }
    }

    // Choose a handlers

    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined'
                        ? router[trimmedPath]
                        : handlers.notFound;

    var data = {
      'trimmedPath'       : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method'            : method,
      'payload'           : buffer,
      'headers'           : headers
    };

    // Call the chosen handlers

    chosenHandler(data, function(statusCode, payload){
      // Use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200
      // Use  the called back payload or an empty object
      payload = typeof(payload) == 'object' ? payload : {};
      // Convert payload to a stringify
      var payloadString = JSON.stringify(payload);

      response.setHeader('Content-Type', 'application/json');
      response.writeHead(statusCode);
      response.end(payloadString);

      if (debugLevel >0) {
        console.log('Returning: ', statusCode, payloadString);
        console.log("----------------------------------------------------------------------------------------\n");
      }

    }); // End Handler Callback

  }); // End request end event handler

}; // End Server's request received callback function


// Create the http server and give it the On Request event handler

const httpServer = http.createServer(CommonServerLogic);

// Start the http server, and have it listen on port config.httpPort

httpServer.listen(config.httpPort, function(){
  if (debugLevel > 0) {
    console.log("The http  server is listening on port " + config.httpPort + " using the " + config.envName + " configurtion.");
  }
});

// Create the https server and give it the On Request event handler

const sslOptions = {
  'key'  : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(sslOptions, CommonServerLogic);

// Start the https server, and have it listen on port config.httpPort

httpsServer.listen(config.httpsPort, function(){
  if (debugLevel > 0) {
    console.log("The https server is listening on port " + config.httpsPort + " using the " + config.envName + " configurtion.");
  }
});

// Define the handlers

const handlers = {};

// Ping handler

handlers.ping = function(data, callback){
  // call back with an http status code 200.
  callback(200);
};

// Hello World handler

// Requirements:

// It should be a RESTful JSON API that listens on a port of your choice

// When someone posts anything to the route /hello,
// you should return a welcome message, in JSON format.
// This message can be anything you want.

// Design Decisions:

// POST method will be made mandatory. (no get behavior is required.)
// Any payload will result in a greeting. (someone posts anything)
// No payload will also result in a greeting. (no stated requirement here)
// Payload may be in JSON format. (since posting anything must yeild a message.)
// If Payload provides a 'name' key, the corresponding value will be used in the greeting.
// Will check for but not reqire the content-type: application/json

handlers.hello = function(data, callback){

  if (data.method != 'POST') {
    callback(406, {'error_code' : 406, 'error_message' : 'You must call the hello API with the HTTP(S) POST method.'});
    return;
  }

  if ((typeof(data.headers['content-type']) == 'undefined')
  ||  (data.headers['content-type'] != 'application/json')) {
    if (debugLevel > 0) {
      console.log('FYI: content type is not marked as application/json in the request headers.')
    }
  }

  if (data.payload == '') {
    callback(200, {'greeting' : 'Hello, person who posts without providing a body!'});
    return;
  }

  var payloadObject = {};
  try {
    payloadObject = JSON.parse(data.payload)
  } catch (err) {
    // 'anything' may or may not be JSON
    if (debugLevel > 0) {
      console.log('JSON.parse(' + data.payload + ') returned  an error: ', err);
    }
    callback(200, {'greeting' : 'Hello, passer of broken JSON!'});
    return;
  }

  if (typeof(payloadObject['name']) != 'string') {
    callback(200, {'greeting' : 'Hello, Why don\'t you try passing JSON with a \'name\' key?'});
  } else {
    callback(200, {'greeting' : 'Hello ' + payloadObject.name + '!' });
  }

};

// Debug handler: Query or set the debugLevel with the GET method. (which is assumed for now)

handlers.debug = function(data, callback) {

  // If no debugLevel query string parameter is provided, just return the current setting.

  if (typeof(data.queryStringObject['debugLevel']) == 'undefined') {
    callback(200, {'debugLevel' : debugLevel});
    return;
  }

// If a debugLevel query string parameter is provided, at least check to see if it is a number.
// Update our debugLevel variable and echo it back out if it is numeric.

  if ((data.queryStringObject.debugLevel == '')
  ||   isNaN(data.queryStringObject.debugLevel)) {
    callback(406, {'error_message' : 'You must provide a numeric debugLevel query string parameter.'});
  } else {
    debugLevel = data.queryStringObject.debugLevel;
    callback(200, {'debugLevel' : debugLevel});
  }

};

// Not Found handler

handlers.notFound = function(data, callback) {
  callback(404);
};

// Define a request router

const router = {
  'ping'   : handlers.ping,
  'hello'  : handlers.hello,
  'debug'  : handlers.debug
};
