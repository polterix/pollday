'use strict';

var Poll = require('../lib/Poll.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.Poll = {
  setUp: function(done) {
    var user = {
      'id': 'id1'
    };

    var title = "Foo";

    var choices = [
      'choice 1',
      'choice 2',
      'choice 3'
    ];

    this.poll = new Poll(user, title, choices);
    done();
  },
  'answer': function(test) {
    var answerer1 = {
      'id' : 'id1'
    };

    this.poll.answer(answerer, 1);
    test.equal(this.poll.results[1], 1, 'user answer is saved');

    this.poll.answer(answerer, 1);
    test.equal(this.poll.results[1], 1, 'user can\'t answer multiple times');

    test.done();
  },
  'answererCount': function(test) {

    var answerer1 = { 'id' : 'id2'};
    var answerer2 = { 'id' : 'id3'};

    this.poll.answer(answerer1, 1);
    this.poll.answer(answerer1, 2);
    this.poll.answer(answerer2, 0);

    test.equal(this.poll.getAnswererCount(), 2);
    test.done();
  }
};
