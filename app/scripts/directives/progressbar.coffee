'use strict'

angular.module('polldayApp')
  .directive 'progressbar', [->
    templateUrl: 'views/progressbar.html'
    restrict: 'A'
    scope:
      value: '=progressvalue'
      max: '=progressmax'
  ]
