'use strict'

angular.module('polldayApp')
  .controller 'MainCtrl', ['$scope', 'Pldsocket', ($scope, Pldsocket) ->

    $scope.role = 'user'
    $scope.choices = []
    $scope.results = []

    $scope.answerIndex = 1

    $scope.addChoice = () ->
      $scope.role = 'admin'
      console.log($scope.choiceText);
      $scope.choices.push $scope.choiceText
      $scope.choiceText = ''

    $scope.removeChoice = (choiceIndex) ->
      $scope.choices.splice(choiceIndex, 1);

    $scope.start = () ->
      Pldsocket.emit 'newPoll', $scope.choices

    $scope.vote = (index) ->
      console.log 'index', index
      Pldsocket.emit 'newVote', index

    Pldsocket.on 'connectedUsers', (data) ->
      $scope.connectedUsers = data

    Pldsocket.on 'newPoll', (datas) ->
      if typeof datas.choices != 'undefined'
        $scope.mode = 'normal'
        $scope.choices = datas.choices
      else
        $scope.mode = 'edit'


    Pldsocket.on 'results', (datas) ->
      if datas.length
        $scope.results = datas
  ]
