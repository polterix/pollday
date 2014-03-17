'use strict';

var Server;
var Poll = require('./Poll.js');
var User = require('./User.js');

/**
 * Server
 *
 * @param io
 * @param options
 * @return
 */
var Server = function (io, options) {
  this.options = options;
  this.io = io;

  this.currentPoll = undefined;
  this.connectedUsers = 0;
  this.answererCount = 0;
  this.logger = console;

  this.userEventNames = ['initPoll','newVote', 'endPoll', 'newPoll', 'disconnect'];

  // Init status
  this.status = this.STATUS_INIT_POLL;

};

Server.prototype.start = function () {
  var _this = this;
  this.io.sockets.on('connection', function(socket) {
    var user = new User(socket);

    _this.onConnection();

    // register user events callbacks
    _this.userEventNames.forEach(function(eventName) {
      user.socket.on(eventName, function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(user);
        _this['on' + eventName.charAt(0).toUpperCase() + eventName.slice(1)].apply(_this, args);
      });
    });
  });
};

Server.prototype.STATUS_INIT_POLL        = 0;
Server.prototype.STATUS_CREATE_POLL      = 1;
Server.prototype.STATUS_POLL_IN_PROGRESS = 2;
Server.prototype.STATUS_POLL_ENDED       = 3;

/**
 * onConnection
 *
 * @param user
 * @return
 */
Server.prototype.onConnection = function (user) {
  this.connectedUsers++;
  this.broadCast('connectedUsers', this.connectedUsers);

  if(this.currentPoll) {
    user.socket.emit('newPoll', this.currentPoll.getDatas());
    user.socket.emit('answererCount', this.currentPoll.answererCount);
  }

  user.socket.emit('status', this.status);

  if(this.status === this.STATUS_POLL_ENDED) {
    user.socket.emit('results', this.currentPoll.getResults());
  }
};

/**
 * onNewVote
 *
 * @param user
 * @param answerIndex
 * @return
 */
Server.prototype.onNewVote = function (user, answerIndex) {
  // if answer index in null
  if(answerIndex == null) {
    return false;
  }

  this.currentPoll.answer(user, answerIndex);

  // broadcast new answererCount
  this.broadCast('answererCount', this.currentPoll.getAnswererCount());
};

/**
 * onEndPoll
 *
 * @return
 */
Server.prototype.onEndPoll = function() {
  this.endCurrentPoll();
};

/**
 * onInitPoll
 *
 * @return
 */
Server.prototype.onInitPoll = function() {
  this.updateStatus(this.STATUS_CREATE_POLL);
};

/**
 * onNewPoll
 *
 * @param user
 * @param pollDatas
 * @return
 */
Server.prototype.onNewPoll = function(user, pollDatas) {
  this.updateStatus(this.STATUS_POLL_IN_PROGRESS);
  var poll = new Poll(user, pollDatas.title, pollDatas.choices);
  this.updateCurrentPoll(poll);
};

/**
 * onDisconnect
 *
 * @param user
 * @return
 */
Server.prototype.onDisconnect = function(user) {
  this.connectedUsers--;

  // if user is author of the current poll end it.
  if(this.currentPoll && this.currentPoll.author.id === user.id) {
    this.endCurrentPoll();
  }

  this.broadCast('connectedUsers', this.connectedUsers);
};

/**
 * updateStatus
 *
 * @param status
 * @return
 */
Server.prototype.updateStatus = function(status) {
  this.status = status;
  this.broadCast('status', this.status);
};

/**
 * updateCurrentPoll
 *
 * @param poll
 * @return
 */
Server.prototype.updateCurrentPoll = function(poll) {
  this.currentPoll = poll;
  this.broadCast('newPoll', poll.getDatas());
};

/**
 * endCurrentPoll
 *
 * @return
 */
Server.prototype.endCurrentPoll = function() {
  var _this = this;
  this.updateStatus(this.STATUS_POLL_ENDED);
  this.broadCast('results', this.currentPoll.getResults());
  setTimeout(function() {
    _this.updateStatus(_this.STATUS_INIT_POLL);
  }, this.options.timeout * 1000);
};

/**
 * broadCast
 *
 * @param channel
 * @param message
 * @return
 */
Server.prototype.broadCast = function(channel, message) {
  return this.io.sockets.emit(channel, message);
};

/**
 * shutdown
 *
 * @return
 */
Server.prototype.shutdown = function() {
  return this.io.sockets.clients().forEach(function(socket) {
    return socket.disconnect();
  });
};

module.exports = Server;

