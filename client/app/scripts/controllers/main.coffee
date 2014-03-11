'use strict'

angular.module('polldayApp')
  .controller 'MainCtrl', ['$scope', 'Pldsocket', ($scope, Pldsocket) ->

    $scope.role = 'user'
    $scope.choices = []
    $scope.results = []

    $scope.addChoice = () ->
      $scope.role = 'admin'
      $scope.choices.push $scope.choiceText
      $scope.choiceText = ''

    $scope.start = () ->
      Pldsocket.emit 'newPoll', $scope.choices

    $scope.vote = (index) ->
      Pldsocket.emit 'newVote', index

    Pldsocket.on 'connectedUsers', (data) ->
      $scope.connectedUsers = data

    Pldsocket.on 'newPoll', (datas) ->
      if typeof datas.choices != 'undefined'
        $scope.choices = datas.choices

    Pldsocket.on 'results', (datas) ->
      if datas.length
        $scope.results = datas
  ]
