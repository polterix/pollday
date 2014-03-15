'use strict';

var Server;

Server = (function() {
  function Server(socketFactory, options) {
    var _this = this;

    this.options = options || {};

    this.options.port            = options.port || 80;
    this.options.loglevel        = options.loglevel || 1;
    this.options.flashpolicyport = options.flashpolicyport || 10843;
    this.options.resetTimeout    = options.resetTimeout || 60;

    this.currentPoll = undefined;

    this.connectedUsers = 0;
    this.answererCount = 0;

    this.logger = console;

    // Init status
    this.status = this.STATUS_NO_POLL

    this.io = socketFactory.create({
      'port'            : this.options.port,
      'flashpolicyport' : this.options.flashpolicyport,
      'loglevel'        : this.options.loglevel
    });

    this.io.sockets.on('connection', function(socket) {
      _this.onConnection(socket);
    });
  }

  Server.prototype.onConnection = function (socket) {

      socket.set('answered', false);
      socket.set('role', 'user');

      this.connectedUsers++;
      this.broadCast('connectedUsers', this.connectedUsers);

      if(this.currentPoll) {
        this.broadCast('newPoll', this.currentPoll);
        this.broadCast('answererCount', this.currentPoll.answererCount);
      }

      this.broadCast('status', this.status);

      if(this.status === this.STATUS_POLL_ENDED) {
        this.broadCast('results', this.currentPoll.getResults());
      }

      this.registerNewVoteHandler(socket);
      this.registerEndPollHandler(socket);
      this.registerNewPollHandler(socket);
      this.registerDisconnectHandler(socket);
  }

  Server.prototype.registerNewVoteHandler = function (socket) {
    var _this = this;
    socket.on('newVote', function(index) {
      if(index == null) {
        return false;
      }

      socket.get('answered', function(value) {
        _this.currentPoll.answer(index);
        socket.set('answered', true);
        _this.broadCast('answererCount', _this.currentPoll.answererCount);
      });

    });
  }

  Server.prototype.registerEndPollHandler = function(socket) {
    var _this = this;
    socket.on('endPoll', function(poll) {
      _this.endCurrentPoll();
    });
  }

  Server.prototype.registerNewPollHandler = function(socket) {
    var _this = this;
    socket.on('newPoll', function(poll) {
      _this.updateStatus(_this.STATUS_POLL_IN_PROGRESS);
      socket.set('role', 'admin');
      var poll = _this.createNewPoll(poll.title, poll.choices);
      _this.updateCurrentPoll(poll);
    });
  }

  Server.prototype.registerDisconnectHandler = function(socket) {
    var _this = this;
    socket.on('disconnect', function() {
      _this.connectedUsers--;

      // if user is admin end current poll
      socket.get('role', function(role) {
        if(role == "admin") {
          _this.endCurrentPoll();
        }
      });

      _this.broadCast('connectedUsers', _this.connectedUsers);
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
    }, this.options.resetTimeout * 1000);
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

