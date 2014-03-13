'use strict'

angular.module('polldayApp')
  .factory 'iCheckService', ['ScriptLoader', '$q', (ScriptLoader, $q) ->

    deferred = $q.defer()

    ScriptLoader.load('bower_components/jquery-icheck/icheck.js').then () ->
      deferred.resolve window.iCheck

    return {
      iCheck: () ->
        return deferred.promise
    }
  ]
