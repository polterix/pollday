'use strict'

angular.module('polldayApp')
  .factory('Pldsocket', ['socketFactory', 'userProvider', 'SOCKET', (socketFactory, userProvider, SOCKET) ->

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

    user = userProvider.getUser()

    options.query = "fingerprint=#{user.id}"

    ioSocket = io.connect "http://#{SOCKET.HOST}:#{SOCKET.PORT}", options

    ioSocket
      .on 'error', (e) ->
        if !ioSocket.socket.reconnecting
          ioSocket.socket.reconnect()
      .on 'disconnect', () ->
        if !ioSocket.socket.reconnecting
          ioSocket.socket.reconnect()

    socket = socketFactory({ ioSocket: ioSocket })
    socket.socket = ioSocket.socket

    return socket
  ])
