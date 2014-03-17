/* global describe, it */

(function () {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var assert = chai.assert;
  var Server = require('../../lib/Server.js');

  describe('Server', function () {

    var io = {};
    var server = new Server(io);

    var user1 = { 'id' : 'id1' };

    describe('#onNewPoll', function () {
      it('should broadcast new poll and update status', function () {
        var stub = sinon.stub(server, 'broadCast');

        var pollDatas = {
          'title' : 'New poll',
          'choices' : ['one', 'two', 'three']
        };

        server.onNewPoll(user1, pollDatas);

        assert.equal(stub.callCount, 2);

        // should broadcast new status
        assert.equal(stub.args[0][0], 'status');
        assert.equal(stub.args[0][1], server.STATUS_POLL_IN_PROGRESS);

        // should broadcast new poll
        assert.equal(stub.args[1][0], 'newPoll');

        server.broadCast.restore();
      });

    });

  });
})();
