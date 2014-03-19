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

  it 'user cannot vote many times', () ->
    spy = sinon.spy(Pldsocket, "emit");

    # user vote choice 0
    scope.vote(0);

    # check Pldsocket.emit function is called
    expect(spy.calledOnce).to.equal(true);

    # user vote choice 1
    scope.vote(1);

    # check Pldsocket.emit function not called again
    expect(spy.calledTwice).to.not.equal(true);

  it 'if a user already voted and a new poll event is received the user can vote again', () ->

    # user has already voted
    localStorage.setItem('voted', true)

    # a new poll event is received
    Pldsocket.emit('newPoll', pollDatas)

    # user can vote again
    expect(localStorage.getItem('voted')).to.not.equal(true)

