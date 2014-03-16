'use strict';

var Server = require('./Server.js');
var SocketFactory = require('./SocketFactory.js');

var _ = require('lodash');

/**
 * Pollday
 *
 * @param options
 * @return
 */
var Pollday = function(options) {
  var default_options = {
    'port'            : 80,
    'loglevel'        : 1,
    'flashpolicyport' : 10843,
    'timeout'         : 60
  };

  this.options = _.merge(default_options, options);

  var socketFactory = new SocketFactory();

  var io = socketFactory.create({
    'port'            : this.options.port,
    'flashpolicyport' : this.options.flashpolicyport,
    'loglevel'        : this.options.loglevel
  });

  var server_options = {
    'timeout': this.options.timeout
  };

  var server = new Server(io, server_options);
};

module.exports = Pollday;
