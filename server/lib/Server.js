'use strict';

var Server;
var Poll = require('./Poll.js');
var User = require('./User.js');

var _ = require('lodash');

/**
* Server
*
* @param socketFactory
* @param options
* @return
*/
var Server = function (socketFactory, options) {
  var _this = this;

  var defaultOptions = {
    'port'            : 80,
    'loglevel'        : 1,
    'flashpolicyport' : 10843,
    'timeout'         : 60
  };

  this.options = _.merge(defaultOptions, options);

  this.currentPoll = undefined;

  this.connectedUsers = 0;
  this.answererCount = 0;

  this.logger = console;

  // Init status
  this.status = this.STATUS_NO_POLL;

  this.io = socketFactory.create({
    'port'            : this.options.port,
    'flashpolicyport' : this.options.flashpolicyport,
    'loglevel'        : this.options.loglevel
  });

  this.io.sockets.on('connection', function(socket) {
    var user = new User(socket);
    _this.onConnection(user);
  });
};

Server.prototype.STATUS_NO_POLL          = 1;
Server.prototype.STATUS_POLL_IN_PROGRESS = 2;
Server.prototype.STATUS_POLL_ENDED       = 3;

/**
* onConnection
*
* @param user
* @return
*/
Server.prototype.onConnection = function (user) {
  var _this = this;

  user.set('role', 'user');

  this.connectedUsers++;
  this.broadCast('connectedUsers', this.connectedUsers);

  if(this.currentPoll) {
    this.broadCast('newPoll', this.currentPoll.getDatas());
    this.broadCast('answererCount', this.currentPoll.answererCount);
  }

  this.broadCast('status', this.status);

  if(this.status === this.STATUS_POLL_ENDED) {
    this.broadCast('results', this.currentPoll.getResults());
  }

  this.events = ['newVote', 'endPoll', 'newPoll', 'disconnect'];

  // register events callbacks
  this.events.forEach(function(eventName) {
    user.socket.on(eventName, function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(user);
      _this['on' + eventName.charAt(0).toUpperCase() + eventName.slice(1)].apply(_this, args);
    });
  });

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
* onNewPoll
*
* @param user
* @param pollDatas
* @return
*/
Server.prototype.onNewPoll = function(user, pollDatas) {
  this.updateStatus(this.STATUS_POLL_IN_PROGRESS);
  user.set('role', 'admin');
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
  var _this = this;
  this.connectedUsers--;

  // if user is admin end current poll
  user.get('role', function(role) {
    if(role === "admin") {
      _this.endCurrentPoll();
    }
  });

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
    _this.updateStatus(_this.STATUS_NO_POLL);
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

