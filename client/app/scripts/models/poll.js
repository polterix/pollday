(function() {
  'use strict';

  var Poll = function(title, choices) {
    this.title = title
    this.choices = choices || [];
    this.results = [];
  }

  Poll.prototype.addChoice = function (choiceText) {
    this.choices.push(choiceText)
  }

  Poll.prototype.removeChoice = function (choiceIndex) {
    this.choices.splice(choiceIndex, 1);
  }

  Poll.prototype.answer = function(choiceIndex) {
    if (typeof this.results[choiceIndex] !== "undefined") {
      this.results[choiceIndex]++;
    } else {
      this.results[choiceIndex] = 1;
    }
  }

  Poll.prototype.getResults = function() {
    return this.results;
  }

  window.Poll = Poll;

})();

