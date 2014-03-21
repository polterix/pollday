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
    'authorId' : '123456'
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

    # a new poll event is received
    Pldsocket.emit('newPoll', pollDatas)

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
    localStorage.setItem('authorId', 'abcde')

    # a new poll event is received
    Pldsocket.emit('newPoll', pollDatas)
    # user can vote again
    scope.vote(0);

    expect(localStorage.getItem('authorId')).to.equal('123456')

  it 'should update user role when user init a new poll and emit initPoll message', () ->
    socketEmitSpy = sinon.spy(Pldsocket, 'emit')

    scope.role = "user"
    scope.init()

    # simulate positive confirmation from server
    socketEmitSpy.callArgWith(2, true)

    expect(scope.role).to.equal 'admin'
    expect(socketEmitSpy.calledWith('initPoll')).to.equal true

  it 'should prevent duplicate choices', () ->
    scope.poll.choices = ['one', 'two']

    scope.choiceText = 'one'
    scope.addChoice()

    expect(scope.poll.choices).to.eql(['one', 'two'])

