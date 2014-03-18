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

    var user1 = { 'id' : 'id1', 'get': function(){}};
    var user2 = { 'id' : 'id2', 'get': function(){}};

    var pollDatas = {
      'title' : 'New poll',
      'choices' : ['one', 'two', 'three']
    };

    describe('#onNewPoll', function () {

      it('should update current poll', function () {
        sinon.stub(server, 'broadCast');
        server.onNewPoll(user1, pollDatas);
        assert.equal(server.currentPoll.title, pollDatas.title);
        assert.equal(server.currentPoll.choices, pollDatas.choices);
        server.broadCast.restore();
      });

      it('should broadcast new poll and update status', function () {
        var stub = sinon.stub(server, 'broadCast');

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

    describe('#onConnection', function () {
      it('on connection user must receive current datas', function() {
        var emitStub = sinon.stub();
        var broadCastStub = sinon.stub(server, 'broadCast');

        var user3 = {
            'socket' : {
                'emit' : emitStub
            }
        };

        server.onConnection(user3);

        assert.equal(emitStub.called, true);
        assert.equal(broadCastStub.called, true);

        server.broadCast.restore();
      });
    });

    describe('#onDisconnect', function () {
      it('if poll author disconnect currentPoll should be ended', function() {
        sinon.stub(server, 'broadCast');
        var endCurrentPollStub = sinon.stub(server, 'endCurrentPoll');

        server.currentPoll = {
          'author'  : user1,
          'title'   : pollDatas.title,
          'choices' : pollDatas.choices,
        };

        // user2 is not the current poll author so 'endCurrentPoll' must not be called
        server.onDisconnect(user2);
        assert.equal(endCurrentPollStub.notCalled, true);

        // user1 is the current poll author so'endCurrentPoll' must be called
        server.onDisconnect(user1);
        assert.equal(endCurrentPollStub.calledOnce, true);

        server.broadCast.restore();
        server.endCurrentPoll.restore();
      });

      it('on user disconnect new connected user number should be broadcasted', function() {
        var stub = sinon.stub(server, 'broadCast');

        server.connectedUsers = 1;

        server.onDisconnect(user2);

        // should broadcast new status
        assert.equal(stub.args[0][0], 'connectedUsers');
        assert.equal(stub.args[0][1], 0);


        server.broadCast.restore();
      });


      it('when an author disconnect status should be updated to STATUS_INIT_POLL and broadcasted', function() {
        var stub = sinon.stub(server, 'broadCast');

        var user3 = {
          'id': 'id3',
          'get': function() {},
          'set': function() {}
        };

        // user get function return author in callback function
        sinon.stub(user3, 'get').callsArgWith(1, null, 'author');

        server.onDisconnect(user3);

        // should broadcast new status
        assert.equal(stub.args[0][0], 'status');
        assert.equal(stub.args[0][1], server.STATUS_INIT_POLL);


        server.broadCast.restore();
      });

    });

  });
})();
