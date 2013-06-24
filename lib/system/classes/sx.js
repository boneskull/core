var Factory;

Factory = require(path.normalize(__dirname + '/factory'));

module.exports = function(root) {
  var sx;
  global.sx = sx = Class.define('sx', {}, function() {
    var init;
    init = function() {
      var factoryChannel, sxChannel;
      factoryChannel = postal.channel('Factory');
      sxChannel = postal.channel('sx');
      sx.implement({
        classes: {},
        modules: {},
        controllers: {},
        models: {},
        paths: {
          'system': path.normalize(root + '/system/'),
          'app': path.normalize(root + '/app/'),
          'public': path.normalize(root + '/public/'),
          'modules': path.normalize(root + '/modules/')
        },
        events: {
          create: postal,
          channel: function(name) {
            return postal.channel(name);
          },
          publish: function(event, data) {
            return sxChannel.publish(event, data);
          },
          subscribe: function(event, cb) {
            return sxChannel.subscribe(event, cb);
          },
          unsubscribe: function(event) {
            var subscriber, subscribers, _i, _len, _results;
            subscribers = postal.utils.getSubscribersFor({
              channel: 'sx',
              topic: event
            });
            if (subscribers != null ? subscribers.length : void 0) {
              _results = [];
              for (_i = 0, _len = subscribers.length; _i < _len; _i++) {
                subscriber = subscribers[_i];
                _results.push(subscriber.unsubscribe());
              }
              return _results;
            }
          }
        }
      });
      factoryChannel.subscribe('class.created', function(data, envelope) {
        if (data["class"] != null) {
          if (data["class"].$singleton === true) {
            sx[data.name] = data["class"];
          }
          return sx.events.publish('class.created', data);
        }
      });
      sx.implement({
        factory: Factory(sx.classes, factoryChannel)
      });
    };
    return {
      init: init
    };
  });
  return sx.init();
};
