'use strict'

angular.module('polldayApp')
  .factory 'ScriptLoader', ['$document', '$rootScope', '$q', ($document, $rootScope, $q) ->
    class ScriptLoader
      constructor: () ->

      load: (src) ->
        deferred = $q.defer()

        onScriptLoad = () ->
          $rootScope.$apply () ->
            deferred.resolve()

        # Create script tag
        scriptTag = $document[0].createElement('script')
        scriptTag.type  = 'text/javascript'
        scriptTag.async = true
        scriptTag.src   = src

        scriptTag.onreadystatechange = () ->
          if this.readyState == 'complete'
            onScriptLoad()

        scriptTag.onload = onScriptLoad

        s = $document[0].getElementsByTagName('body')[0]
        s.appendChild scriptTag

        return deferred.promise

    return new ScriptLoader()
  ]
