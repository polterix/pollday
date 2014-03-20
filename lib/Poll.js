'use strict';

/**
 * Poll
 *
 * @param {User} author
 * @param {string} title
 * @param {Array} choices
 * @return void
 */
var Poll = function(author, title, choices) {
  this.author = author;
  this.title = title;
  this.choices = choices;
  this.results = [];
  this.voters = {};
};

/**
 * answer
 *
 * @method answer
 * @param {User} user
 * @param choiceIndex
 * @return
 */
Poll.prototype.answer = function(user, choiceIndex) {

  // if choices index is invalid
  if(typeof this.choices[choiceIndex] === 'undefined') {
    return false;
  }

  // if user already voted
  if(this.userHasAlreadyVoted(user)) {
    return false;
  }

  // if user is author
  if(this.author.id === user.id) {
    return false;
  }

  if (typeof this.results[choiceIndex] !== "undefined") {
    this.results[choiceIndex]++;
  } else {
    this.results[choiceIndex] = 1;
  }

  // add user to the voters collection
  this.voters[user.id] = user;

  return true;
};

/**
 * getAnswererCount
 *
 * @return
 */
Poll.prototype.getAnswererCount = function() {
  return Object.keys(this.voters).length;
};

/**
 * userHasAlreadyVoted
 *
 * @method userHasAlreadyVoted
 * @param {User} user
 * @return
 */
Poll.prototype.userHasAlreadyVoted = function(user) {
  var userIds = Object.keys(this.voters);
  return userIds.indexOf(user.id) !== -1;
};

/**
 * getResults
 *
 * @method getResults
 * @return {Array}
 */
Poll.prototype.getResults = function() {
  var rank = [];
  for (var i in this.choices) {
     rank.push(this.results[i] || 0);
  }
  return rank;
};

Poll.prototype.getDatas = function() {
  return {
    'authorId' : this.author.id,
    'title' : this.title,
    'choices' : this.choices,
    'results' : this.getResults(),
    'answererCount' : this.getAnswererCount()
  };
};

module.exports = Poll;

