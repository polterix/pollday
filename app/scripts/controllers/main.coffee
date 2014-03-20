'use strict'

angular.module('polldayApp')
  .controller 'MainCtrl', ['$scope', 'Pldsocket', ($scope, Pldsocket) ->

    $scope.poll = new Poll()
    $scope.role = 'user'

    Pldsocket.on 'connectedUsers', (data) ->
      $scope.connectedUsers = data

    Pldsocket.on 'answererCount', (data) ->
      $scope.answererCount = data

    Pldsocket.on 'newPoll', (datas) ->
      $scope.poll = new Poll(datas.title, datas.choices)
      $scope.ranking = []
      $scope.answererCount = 0
      $scope.authorId = datas.authorId

    Pldsocket.on 'status', (datas) ->
      switch datas
        when 0 then $scope.mode = 'init'
        when 1 then $scope.mode = 'edit'
        when 2
          $scope.mode = 'normal'
          if localStorage.getItem("authorId") == $scope.authorId
            $scope.poll.answered = true 
        when 3 then $scope.mode = 'results'

    Pldsocket.on 'results', (datas) ->
      if datas.length
        $scope.ranking = for id, count of datas
          {'id':id, 'label': $scope.poll.choices[id], 'nbVotes':count}
        $scope.mode = 'results'

    $scope.init = () ->
      # wait poll init confirmation from server
      Pldsocket.emit 'initPoll', null, (confirmed) ->
        if confirmed then $scope.role = 'admin'

    $scope.addChoice = () ->

      # prevent duplicate choices
      if $scope.poll.choices.indexOf($scope.choiceText) != -1
        return false

      $scope.poll.addChoice($scope.choiceText)
      $scope.choiceText = ''

    $scope.removeChoice = (choiceIndex) ->
      $scope.poll.removeChoice(choiceIndex)

    $scope.start = () ->
      # wait for new poll submission confirmation from server
      Pldsocket.emit 'newPoll', $scope.poll, (confirmed) ->
        if confirmed then $scope.mode = 'waiting'

    $scope.stop = () ->
      Pldsocket.emit 'endPoll'

    $scope.vote = (index) ->
      if localStorage.getItem("authorId") == $scope.authorId
        return false

      # wait for vote confirmation from server
      Pldsocket.emit 'newVote', index, (confirmed) ->
        $scope.poll.answered = true
        localStorage.setItem("authorId", $scope.authorId)
        if confirmed then localStorage.setItem("voted", true)
  ]
