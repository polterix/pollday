'use strict'

angular.module('polldayApp')
  .controller 'MainCtrl', ['$scope', 'Pldsocket', ($scope, Pldsocket) ->

    $scope.poll = new Poll()
    $scope.role = 'user'

    $scope.addChoice = () ->
      $scope.poll.addChoice($scope.choiceText)
      $scope.choiceText = ''

    $scope.removeChoice = (choiceIndex) ->
      $scope.poll.removeChoice(choiceIndex)

    $scope.start = () ->
      $scope.role = 'admin'
      Pldsocket.emit 'newPoll', $scope.poll

    $scope.stop = () ->
      Pldsocket.emit 'endPoll'

    $scope.vote = (index) ->
      $scope.mode = 'waiting'
      Pldsocket.emit 'newVote', index

    Pldsocket.on 'connectedUsers', (data) ->
      $scope.connectedUsers = data

    Pldsocket.on 'newPoll', (datas) ->
      $scope.poll = new Poll(datas.title, datas.choices)

    Pldsocket.on 'status', (datas) ->
      switch datas
        when 1 then $scope.mode = 'edit'
        when 2 then $scope.mode = 'normal'
        when 3 then $scope.mode = 'result'

    Pldsocket.on 'results', (datas) ->
      if datas.length
        $scope.results = datas
        $scope.mode = 'results'
  ]
