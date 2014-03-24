'use strict'

angular.module("polldayApp")
  .factory('Pldsocket', ['$rootScope', ($rootScope) ->
    class Pldsocket
      constructor: () ->
        @events = {}
        @socket = {
          'id': 'socket_id'
        }

      on: (eventName, callback) ->
        if typeof @events[eventName] is 'undefined'
          @events[eventName] = []
        @events[eventName].push(callback)
        return @

      emit: (eventName, data, emitCallback) ->
        if @events[eventName]
          angular.forEach(@events[eventName], (callback) ->
            $rootScope.$apply () ->
              callback(data)
          )

        if emitCallback then emitCallback()
        return @

    return new Pldsocket()

  ])

