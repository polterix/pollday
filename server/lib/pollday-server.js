'use strict';

var Server;

Server = (function() {
  function Server(port, resetTimeout) {
    var _this;
    _this = this;

    this.resetTimeout = resetTimeout || 60;
    this.currentPoll = undefined;
    this.connectedUsers = 0;
    this.logger = console;

    // Init status
    this.status = this.STATUS_NO_POLL

    // Create server instance
    this.socketApp = require('http').createServer();
    this.socketApp.listen(port);

    // Create socket io instance
    this.io = this.createIOInstance(this.socketApp);

    this.io.sockets.on('connection', function(socket) {
      var role;
      var answered = false;

      role = 'user';
      _this.connectedUsers++;
      _this.broadCast('connectedUsers', _this.connectedUsers);

      if(_this.currentPoll) {
        _this.broadCast('newPoll', _this.currentPoll);
      }

      _this.broadCast('status', _this.status);

      socket.on('newVote', function(index) {
        if(answered) {
          return false;
        }
        _this.currentPoll.answer(index);
        answered = true;
      });

      socket.on('endPoll', function(poll) {
        _this.endCurrentPoll();
      });

      socket.on('newPoll', function(poll) {
        _this.updateStatus(_this.STATUS_POLL_IN_PROGRESS);
        role = 'admin';
        var poll = _this.createNewPoll(poll.title, poll.choices);
        _this.updateCurrentPoll(poll);
      });

      return socket.on('disconnect', function() {
        _this.connectedUsers--;

        // if user is admin end current poll
        if(role == "admin") {
          _this.endCurrentPoll();
        }

        return _this.broadCast('connectedUsers', _this.connectedUsers);
      });
    });
  }

  Server.prototype.updateStatus = function(status) {
    this.status = status;
    this.broadCast('status', this.status);
  }

  Server.prototype.updateCurrentPoll = function(poll) {
    this.currentPoll = poll
    this.broadCast('newPoll', poll);
  }

  Server.prototype.STATUS_NO_POLL = 1;
  Server.prototype.STATUS_POLL_IN_PROGRESS = 2;
  Server.prototype.STATUS_POLL_ENDED = 3;

  Server.prototype.createNewPoll = function(title, choices) {
    var Poll = require('./poll.js');
    return new Poll(title, choices);
  }

  Server.prototype.endCurrentPoll = function() {
    var _this = this;

    this.updateStatus(this.STATUS_POLL_ENDED);
    this.broadCast('results', this.currentPoll.getResults());

    setTimeout(function() {
      _this.updateStatus(_this.STATUS_NO_POLL);
    }, this.resetTimeout * 1000);
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

