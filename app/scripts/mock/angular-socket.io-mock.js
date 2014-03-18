/* global angular: false */
var ng = angular.module("btford.socket-io",[])

ng.provider("socketFactory", function(){

  // expose to provider
  this.$get = function ($rootScope, $timeout) {

    return function socketFactory (options) {
      options = options || {};

      var addListener = function (eventName, callback) {
      };

      var wrappedSocket = {
        on: addListener,
        addListener: addListener,

        emit: function (eventName, data, callback) {
        },

        removeListener: function () {
        },

        forward: function (events, scope) {
        }
      };

      return wrappedSocket;
    };
  };

});

ng.provider("socket", function(){
  this.$get = function($rootScope){

    var obj = {}
    obj.events = {}
    obj.emits = {}

    // intercept 'on' calls and capture the callbacks
    obj.on = function(eventName, callback){
      if(!this.events[eventName]) this.events[eventName] = []
      this.events[eventName].push(callback)
    }

    // intercept 'emit' calls from the client and record them to assert against in the test
    obj.emit = function(eventName){
      var args = Array.prototype.slice.call(arguments,1)

      if(!this.emits[eventName])
        this.emits[eventName] = []
      this.emits[eventName].push(args)
    }

    //simulate an inbound message to the socket from the server (only called from the test)
    obj.receive = function(eventName){
      var args = Array.prototype.slice.call(arguments,1)

      if(this.events[eventName]){
        angular.forEach(this.events[eventName], function(callback){
          $rootScope.$apply(function() {
            callback.apply(this, args)
          })
        })
      }
    }
    return obj
  }
})

