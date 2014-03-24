'use strict'

angular.module('polldayApp')
  .controller 'MainCtrl', ['$scope', 'Pldsocket', 'userProvider', ($scope, Pldsocket, userProvider) ->

    $scope.user = userProvider.getUser()

    # on connected users count update
    Pldsocket.on 'connectedUsers', (data) ->
      $scope.connectedUsers = data

    # on connected answerer count update
    Pldsocket.on 'answererCount', (data) ->
      $scope.poll.answererCount = data

    # on poll update
    Pldsocket.on 'newPoll', (datas) ->
      $scope.poll = Poll.prototype.fromDatas(datas)

    # on status update
    Pldsocket.on 'status', (datas) ->
      switch datas
        when 0 then $scope.mode = 'init'
        when 1 then $scope.mode = 'edit'
        when 2 then $scope.mode = 'normal'
        when 3 then $scope.mode = 'results'

    # on results update
    Pldsocket.on 'results', (datas) ->
      $scope.poll.results = datas

    $scope.init = () ->
      # wait poll init confirmation from server
      Pldsocket.emit 'initPoll', null, (confirmed) ->
        if confirmed
          $scope.poll = new Poll()
          $scope.poll.author = $scope.user.id

    $scope.addChoice = () ->

      # prevent duplicate choices
      if $scope.poll.choices.indexOf($scope.choiceText) != -1
        return false

      $scope.poll.addChoice($scope.choiceText)
      $scope.choiceText = ''

    $scope.removeChoice = (choiceIndex) ->
      $scope.poll.removeChoice(choiceIndex)

    $scope.start = () ->
      Pldsocket.emit 'newPoll', $scope.poll.toDatas()

    $scope.stop = () ->
      Pldsocket.emit 'endPoll'

    $scope.vote = (index) ->
      # wait for vote confirmation from server
      Pldsocket.emit 'newVote', index, (confirmed) ->
        if confirmed
          $scope.poll.markAsAnswered()
  ]
