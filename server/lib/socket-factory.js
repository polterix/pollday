(function() {
  'use strict';

  var SocketFactory = function() {

  }

  SocketFactory.prototype.create = function(options) {

    options = options || {};
    options.port = options.port || 80;
    options.loglevel = options.loglevel || 1;
    options.flashpolicyport = options.flashpolicyport || 10843;

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
  }

  module.exports =  SocketFactory;

})();


