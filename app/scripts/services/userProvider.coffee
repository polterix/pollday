'use strict'

angular.module('polldayApp')
  .factory 'userProvider', () ->

    is_touch_device = () ->
      return 'ontouchstart' in window or 'onmsgesturechange' in window

    get_random_string = () ->
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)

    get_uid = () ->
      fingerprint = new Fingerprint().get()
      if is_touch_device
        fingerprint += get_random_string()
      return fingerprint

    class UserProvider
      getUser: () ->
        # get current user id
        if localStorage.getItem('user_id')
          uid = localStorage.getItem('user_id')
        else
          uid = get_uid()
          localStorage.setItem('user_id', uid)

        return new User(uid)

    return new UserProvider

