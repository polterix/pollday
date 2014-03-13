'use strict'

angular.module('polldayApp')
  .directive('icheck', ['iCheckService', '$timeout',  (iCheckService, $timeout) ->
    restrict: 'A'
    link: (scope, element) ->

      options =
        checkboxClass : 'icheckbox_minimal'
        radioClass    : 'iradio_minimal'
        increaseArea  : '20%' #optional

      iCheckService.iCheck().then () ->
        $timeout () ->
          element.iCheck options

  ])
