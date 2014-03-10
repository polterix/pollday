'use strict';

var Server;

Server = (function(port) {
  function Server(publisher, apiManager, updateFrequency) {
    var _this;
    this.publisher = publisher;
    this.apiManager = apiManager;
    this.updateFrequency = updateFrequency;
    this.currentPoll = [];
    this.connectedUsers = 0;
    this.logger = console;
    this.socketApp = require('http').createServer();
    this.socketApp.listen(port);
    this.io = require('socket.io').listen(this.socketApp);
    _this = this;
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
        _this.currentPoll = require('poll');
        return _this.broadCast('newPoll', poll);
      });
      return socket.on('disconnect', function() {
        _this.connectedUsers--;
        return _this.broadCast('connectedUsers', _this.connectedUsers);
      });
    });
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

