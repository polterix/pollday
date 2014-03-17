'use strict'

angular.module('polldayApp')
  .directive('icheck', ['iCheckService', '$timeout',  (iCheckService, $timeout) ->
    require: '?ngModel'
    restrict: 'A'
    link: ($scope, element, $attrs, ngModel) ->
      $timeout () ->
        value = $attrs['value']
        options =
          checkboxClass : 'icheckbox_minimal'
          radioClass    : 'iradio_minimal'
          increaseArea  : '20%' #optional
        $scope.$watch($attrs['ngModel']) (newValue) ->
          $(element).iCheck('update')
        $(element).iCheck(options).on('ifChanged', (event) -> $scope.$apply ->
              ngModel.$setViewValue(value);)
  ])
