'use strict';

/**
 * User
 *
 * @param socket
 * @return
 */
var User = function(socket) {
  this.socket = socket;
  this.id = this.socket.handshake.query.fingerprint ? this.socket.handshake.query.fingerprint : this.socket.id;
};

/**
 * set
 *
 * @param name
 * @param value
 * @param fn
 * @return
 */
User.prototype.set = function(name, value, fn) {
  return this.socket.set(name, value, fn);
};

/**
 * get
 *
 * @param name
 * @param fn
 * @return
 */
User.prototype.get = function(name, fn) {
  return this.socket.get(name, fn);
};

module.exports = User;
