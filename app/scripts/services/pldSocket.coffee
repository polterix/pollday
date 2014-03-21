'use strict'

angular.module('polldayApp')
  .factory('Pldsocket', ['socketFactory', 'SOCKET', (socketFactory, SOCKET) ->

    options =
      'connect timeout'           : 7000
      'try multiple transports'   : true
      'transports'                : [
        'websocket'
        'xhr-polling'
        'jsonp-polling'
        'htmlfile'
        'xhr-multipart'
        'flashsocket'
      ]
      'reconnect'                 : true
      'reconnection delay'        : 2000
      'reconnection limit'        : 8000
      'reopen delay'              : 3000
      'max reconnection attempts' : Infinity

    fingerprint = new Fingerprint().get()

    options.query = "fingerprint=#{fingerprint}"

    ioSocket = io.connect "http://#{SOCKET.HOST}:#{SOCKET.PORT}", options

    ioSocket
      .on 'error', () ->
        if !ioSocket.socket.reconnecting
          ioSocket.socket.reconnect()
      .on 'disconnect', () ->
        if !ioSocket.socket.reconnecting
          ioSocket.socket.reconnect()

    socket = socketFactory({ ioSocket: ioSocket })
    socket.socket = ioSocket.socket

    return socket
  ])
