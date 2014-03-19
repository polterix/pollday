'use strict'

describe 'Controller: MainCtrl', () ->

  # load the controller's module
  beforeEach () ->
    module 'polldayApp'

  MainCtrl = {}
  Pldsocket = {}
  scope = {}

  pollDatas = {
    'title' : 'Poll title'
    'choices' : ['one', 'two', 'three']
  }

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope, $injector) ->
    scope = $rootScope.$new()

    Pldsocket = $injector.get('Pldsocket')
    scope = $rootScope.$new()

    MainCtrl = $controller 'MainCtrl', {
      $scope: scope
      Pldsocket: Pldsocket
    }

  it 'should update the scope poll value on newPoll event', () ->
    Pldsocket.emit('newPoll', pollDatas)
    expect(scope.poll.title).to.equal pollDatas.title
    expect(scope.poll.choices).to.equal pollDatas.choices

  it 'should update the scope mode value on status event', () ->
    Pldsocket.emit('status', 0)
    expect(scope.mode).to.equal 'init'

    Pldsocket.emit('status', 1)
    expect(scope.mode).to.equal 'edit'

    Pldsocket.emit('status', 2)
    expect(scope.mode).to.equal 'normal'

    Pldsocket.emit('status', 3)
    expect(scope.mode).to.equal 'results'
