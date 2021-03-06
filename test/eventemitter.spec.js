
var EventEmitter;

EventEmitter = factory('eventemitter', require('../lib/system/classes/event_emitter.js'));

module.exports = {
  'eventemitter': {
    'should work as the original thing': function(done) {
      var myemitter;

      myemitter = new EventEmitter();

      myemitter.on('test', function(data) {
        expect(data).to.be(true);
        return done();
      });

      expect(myemitter.listeners('test').length).to.equal(1);
      return myemitter.emit('test', true);
    }
  }
};
