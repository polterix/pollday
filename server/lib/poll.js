(function() {
  'use strict';

  var Poll = function(title, choices) {
    this.title = title
    this.choices = choices;
    this.results = [];
    this.answererCount = 0;
  }

  Poll.prototype.answer = function(choiceIndex) {
    this.answererCount++
    if (typeof this.results[choiceIndex] !== "undefined") {
      this.results[choiceIndex]++;
    } else {
      this.results[choiceIndex] = 1;
    }
  }

  Poll.prototype.getResults = function() {
    return this.results;
  }

  module.exports = Poll;

})();

