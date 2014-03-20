/* global describe, it, beforeEach */
/* jshint expr:true */

(function () {
  'use strict';

  var chai = require('chai');
  var expect = chai.expect;
  var Poll = require('../../lib/Poll.js');

  describe('Poll', function () {

    var author = {
      'id': 'id1'
    };

    var title = "Foo";

    var choices = [
      'choice 1',
      'choice 2',
      'choice 3'
    ];

    var poll;

    beforeEach(function(){
      poll = new Poll(author, title, choices);
    });

    describe('#answer', function () {
      var answerer1 = { 'id' : 'id1' };
      var answerer2 = { 'id' : 'id2' };

      it('should save user answer', function () {
        var returnedValue = poll.answer(answerer2, 1);
        expect(poll.results[1]).to.equal(1);
        expect(returnedValue).to.be.true;
      });
      it('should accept only one vote by user', function () {
        // first answer
        poll.answer(answerer2, 1);
        // second answer
        var returnedValue = poll.answer(answerer2, 1);
        expect(returnedValue).to.be.false;
      });
      it('should reject author vote', function () {
        var returnedValue = poll.answer(answerer1, 1);
        expect(returnedValue).to.be.false;
      });
      it('should reject user answer if answerIndex is invalid', function () {
        var returnedValue = poll.answer(answerer2, 5);
        expect(returnedValue).to.be.false;
      });
    });

    describe('#getAnswerCount', function () {
      it('should return the correct answerer count', function () {
        var answerer1 = { 'id' : 'id2'};
        var answerer2 = { 'id' : 'id3'};

        poll.answer(answerer1, 1);
        poll.answer(answerer1, 2);
        poll.answer(answerer2, 0);

        expect(poll.getAnswererCount()).to.equal(2);
      });
    });

  });
})();
