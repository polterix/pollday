'use strict'

angular.module('polldayApp')
  .controller 'MainCtrl', ['$scope', 'Pldsocket', ($scope, Pldsocket) ->

    $scope.poll = new Poll();
    $scope.role = 'user'

    $scope.answerIndex = 1

    $scope.addChoice = () ->
      $scope.role = 'admin'
      $scope.poll.addChoice($scope.choiceText)
      $scope.choiceText = ''

    $scope.removeChoice = (choiceIndex) ->
      $scope.poll.removeChoice(choiceIndex)

    $scope.start = () ->
      Pldsocket.emit 'newPoll', $scope.poll

    $scope.vote = (index) ->
      console.log 'index', index
      Pldsocket.emit 'newVote', index

    Pldsocket.on 'connectedUsers', (data) ->
      $scope.connectedUsers = data

    Pldsocket.on 'newPoll', (datas) ->
      if typeof datas.choices != 'undefined'
        $scope.mode = 'normal'
        $scope.poll = new Poll(datas.title, datas.choices);
      else
        $scope.mode = 'edit'

    Pldsocket.on 'results', (datas) ->
      if datas.length
        $scope.results = datas
  ]
