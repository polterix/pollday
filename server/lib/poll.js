(function() {
  'use strict';

  var Poll = function(choices) {
    this.choices = choices
    this.results = []
  }

  Poll.prototype.answer = function(choiceIndex) {
    if (typeof this.results[choiceIndex] !== "undefined") {
      this.results[choiceIndex]++;
    } else {
      this.results[choiceIndex] = 0;
    }
  }

  Poll.prototype.getResults = function() {
    return this.results;
  }

  module.exports = Poll;

})();

