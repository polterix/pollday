'use strict';

var Server;

Server = (function() {
  function Server(port, updateFrequency) {
    var _this;
    _this = this;

    this.updateFrequency = updateFrequency;
    this.currentPoll = [];
    this.connectedUsers = 0;
    this.logger = console;

    // Create server instance
    this.socketApp = require('http').createServer();
    this.socketApp.listen(port);

    // Create socket io instance
    this.io = this.createIOInstance(this.socketApp);

    this.io.sockets.on('connection', function(socket) {
      var role;
      role = 'user';
      _this.connectedUsers++;
      _this.broadCast('connectedUsers', _this.connectedUsers);
      _this.broadCast('newPoll', _this.currentPoll);
      socket.on('newVote', function(index) {
        _this.currentPoll.answer(index);
        return _this.broadCast('results', _this.currentPoll.getResults());
      });
      socket.on('newPoll', function(poll) {
        role = 'admin';
        var poll = _this.createNewPoll(poll.title, poll.choices);
        _this.currentPoll = poll;
        return _this.broadCast('newPoll', poll);
      });
      return socket.on('disconnect', function() {
        _this.connectedUsers--;
        return _this.broadCast('connectedUsers', _this.connectedUsers);
      });
    });
  }

  Server.prototype.createNewPoll = function(title, choices) {
    var Poll = require('./poll.js');
    return new Poll(title, choices);
  }

  Server.prototype.createIOInstance = function(socketApp) {
    var io = require('socket.io').listen(socketApp);

    io.enable('browser client minification');
    io.enable('browser client gzip');
    io.enable('browser client etag');

    io.set('log level', 3);
    io.set('transports', [
      'websocket',
      'flashsocket',
      'htmlfile',
      'xhr-polling',
      'jsonp-polling'
    ]);

    return io;
  }

  Server.prototype.broadCast = function(channel, message) {
    return this.io.sockets.emit(channel, message);
  };

  Server.prototype.shutdown = function() {
    return this.io.sockets.clients().forEach(function(socket) {
      return socket.disconnect();
    });
  };

  return Server;

})();

module.exports = Server;

