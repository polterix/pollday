/* global describe, it, beforeEach, afterEach */

(function () {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var assert = chai.assert;
  var Server = require('../../lib/Server.js');
  var Poll = require('../../lib/Poll.js');

  describe('Server', function () {

    var io = {};
    var server = new Server(io);

    var user1 = { 'id' : 'id1'};
    var user2 = { 'id' : 'id2'};

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

        // check author id is sended
        var submitedPollDatas = stub.args[1][1];
        assert.equal(submitedPollDatas.authorId, user1.id);

        server.broadCast.restore();
      });

    });

    describe('#onConnection', function () {

      it('should send current datas to the new connected user', function() {
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

      it('should emit current poll results if status is STATUS_POLL_ENDED', function() {

        sinon.stub(server, 'broadCast');

        server.status = server.STATUS_POLL_ENDED;

        var emitStub = sinon.stub();

        var pollResults = [0, 1, 2];

        server.currentPoll = new Poll(user1, pollDatas.title, pollDatas.choices);
        server.results = pollResults;

        var user3 = {
          'socket' : {
            'emit' : emitStub
          }
        };

        server.onConnection(user3);

        emitStub.calledWith('results', pollResults);

        server.broadCast.restore();

      });
    });

    describe('#onInitPoll', function () {
      it('should change status to … and send confirmation to user', function() {
        var broadCastStub = sinon.stub(server, 'broadCast');
        var callback = sinon.stub();

        // init status
        server.status = server.STATUS_INIT_POLL;

        server.onInitPoll(user1, null, callback);

        // check status broadcast
        assert.equal(broadCastStub.calledWith('status', server.STATUS_CREATE_POLL), true);

        // check user reveive positive confirmation
        assert.equal(callback.calledWith(true), true);

        // re-init callback
        callback = sinon.stub();

        // if another user try to init a poll
        server.onInitPoll(user2, null, callback);

        // check this user receive a negative confirmation
        assert.equal(callback.calledWith(false), true);

        server.broadCast.restore();
      });
    });

    describe('#onDisconnect', function () {
      it('if poll author disconnect currentPoll should be ended', function() {

        sinon.stub(server, 'broadCast');
        var endCurrentPollStub = sinon.stub(server, 'endCurrentPoll');

        // init status
        server.status = server.STATUS_POLL_IN_PROGRESS;

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

        var user3 = {'id': 'id3'};

        server.currentPoll.author = user3;
        server.status = server.STATUS_CREATE_POLL;
        server.onDisconnect(user3);

        // should broadcast new status
        assert.equal(stub.args[0][0], 'status');
        assert.equal(stub.args[0][1], server.STATUS_INIT_POLL);


        server.broadCast.restore();
      });

    });

    describe('#onNewVote', function () {

      beforeEach(function() {
        server.status = server.STATUS_POLL_IN_PROGRESS;
        server.currentPoll = new Poll(user1, pollDatas.title, pollDatas.choices);
        sinon.stub(server, 'broadCast');
      });

      afterEach(function() {
        server.broadCast.restore();
      });

      it('should register new vote', function () {
        var pollAnswerStub = sinon.stub(server.currentPoll, 'answer');
        var callback = sinon.stub().returns(false);

        server.onNewVote(user2, 1, callback);

        // check vote has been registered
        assert.isTrue(pollAnswerStub.calledWith(user2, 1));

        // check callback call
        assert.isTrue(callback.calledWith(false));
      });

    });

    describe('#onEndPoll', function () {

      it('should call endCurrentPoll only if the user is the poll author', function () {

        server.currentPoll = {
          'author'  : user1,
          'title'   : pollDatas.title,
          'choices' : pollDatas.choices,
        };

        var endCurrentPollSpy = sinon.stub(server, 'endCurrentPoll');

        // if user is not the author
        server.onEndPoll(user2);
        assert.equal(endCurrentPollSpy.notCalled, true);

        // if user is the author
        server.onEndPoll(user1);
        assert.equal(endCurrentPollSpy.calledOnce, true);

        server.endCurrentPoll.restore();

      });

    });

  });

})();
