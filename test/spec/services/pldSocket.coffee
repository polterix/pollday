'use strict'

describe 'Service: Pldsocket', () ->

  # load the service's module
  beforeEach module 'polldayApp'

  # instantiate service
  Pldsocket = {}
  beforeEach inject (_Pldsocket_) ->
    Pldsocket = _Pldsocket_

  it 'should do something', () ->
    expect(!!Pldsocket).toBe true
