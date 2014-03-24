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
      userProvider: {
        getUser: () ->
          return new User('user_id')
      }
    }

  it 'should update the scope poll value on newPoll event', () ->
    Pldsocket.emit('newPoll', pollDatas)
    expect(scope.poll.title).to.equal pollDatas.title
    expect(scope.poll.choices).to.equal pollDatas.choices
    expect(scope.poll.author).to.equal pollDatas.authorId

  it 'should update the scope mode value on status event', () ->
    Pldsocket.emit('status', 0)
    expect(scope.mode).to.equal 'init'

    Pldsocket.emit('status', 1)
    expect(scope.mode).to.equal 'edit'

    Pldsocket.emit('status', 2)
    expect(scope.mode).to.equal 'normal'

    Pldsocket.emit('status', 3)
    expect(scope.mode).to.equal 'results'

  it 'should emit newVote event when user vote and mark poll answered', () ->

    # a new poll event is received
    Pldsocket.emit('newPoll', pollDatas)

    spy = sinon.spy(Pldsocket, "emit")

    # user vote choice 0
    scope.vote(0)

    # simulate positive confirmation from server
    spy.callArgWith(2, true)

    # check Pldsocket.emit function is called
    expect(spy.calledOnce).to.be.true

    # check poll is marked has answered
    expect(scope.poll.answered).to.be.true

  it 'should send initPoll event and init new poll on init user call', () ->
    socketEmitSpy = sinon.spy(Pldsocket, 'emit')

    scope.init()

    # simulate positive confirmation from server
    socketEmitSpy.callArgWith(2, true)

    # check the initPoll event is sent
    expect(socketEmitSpy.calledWith('initPoll')).to.be.true

    # check the current poll author is the current user id
    expect(scope.poll.author).to.equal scope.user.id

  it 'should prevent duplicate choices', () ->

    scope.poll = new Poll.prototype.fromDatas(pollDatas)

    scope.poll.choices = ['one', 'two']

    scope.choiceText = 'one'
    scope.addChoice()

    expect(scope.poll.choices).to.eql(['one', 'two'])

