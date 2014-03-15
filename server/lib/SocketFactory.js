'use strict';

var _ = require('lodash');

/**
 * SocketFactory
 *
 * @return
 */
var SocketFactory = function() {

};

/**
 * create
 *
 * @param options
 * @return
 */
SocketFactory.prototype.create = function(options) {

  var defaultOptions = {
    'port'            : 80,
    'loglevel'        : 1,
    'flashpolicyport' : 10843
  };

  options = _.merge(defaultOptions, options);

  // Create server instance
  var socketApp = require('http').createServer();
  socketApp.listen(options.port);

  // Create socket io instance
  var io = require('socket.io').listen(socketApp, {
    'flash policy port': options.flashpolicyport
  });

  io.enable('browser client minification');
  io.enable('browser client gzip');
  io.enable('browser client etag');

  io.set('log level', options.loglevel);
  io.set('transports', [
    'websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ]);

  return io;
};

module.exports =  SocketFactory;

