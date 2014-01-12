EventEmitter = factory('eventemitter', require '../lib/system/classes/event_emitter.js')

module.exports = {
  'eventemitter': {
    'should work as the original thing': (done) ->
      myemitter = new EventEmitter()

      myemitter.on('test', (data) ->
        expect(data).to.be(true)
        done()
      )

      expect(myemitter.listeners('test').length).to.equal(1)

      myemitter.emit('test', true)
  }
}