'use strict';

module.exports = function() {
  var Poll = function() {
    this.choices = []
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

  return Poll;
}
