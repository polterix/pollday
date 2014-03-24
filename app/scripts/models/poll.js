(function() {
  'use strict';

  var Poll = function(id, title, choices) {
    this.id = id;
    this.title = title;
    this.choices = choices || [];

    this.results = [];
    this.answererCount = 0;
    this.answered = false;

    this.resultsDatas = [];
  };

  Poll.prototype.markAsAnswered = function() {
    this.answered = true;
    return this;
  };

  Poll.prototype.addChoice = function (choiceText) {
    this.choices.push(choiceText);
  };

  Poll.prototype.removeChoice = function (choiceIndex) {
    this.choices.splice(choiceIndex, 1);
  };

  Poll.prototype.updateResultsDatas = function() {
    if (!this.results.length) {
      return false;
    }

    var resultsDatas = [];
    var choiceLength = this.choices.length;
    for (var i = 0; i < choiceLength; i++) {
      resultsDatas.push({
        'title' : this.choices[i],
        'value' : this.results[i]
      });
    }

    this.resultsDatas = resultsDatas;
  };

  Poll.prototype.getResults = function() {
    return this.results;
  };

  Poll.prototype.fromDatas = function(datas) {
    var poll = new Poll(datas.id, datas.title, datas.choices);
    poll.author = datas.authorId;
    poll.answererCount = datas.answererCount;
    poll.results = datas.results;
    return poll;
  };

  Poll.prototype.toDatas = function() {
    return {
      id: this.id,
      title: this.title,
      choices: this.choices
    };
  };

  window.Poll = Poll;

})();

