var Factory;

Factory = require(path.normalize(__dirname + '/classes/factory'));

module.exports = function(root) {
  'use strict';
  global.sx = ES5Class.define('sx', {}, function() {
    var init,
      _this = this;
    init = function() {
      var factoryChannel, readdir, sxChannel, toPath;
      factoryChannel = postal.channel('Factory');
      sxChannel = postal.channel('sx');
      _this.implement({
        classes: {},
        modules: {},
        controllers: {},
        routes: {},
        models: {},
        paths: {
          'root': path.normalize(root + '/'),
          'system': path.normalize(root + '/system/'),
          'app': path.normalize(root + '/app/'),
          'public': path.normalize(root + '/public/'),
          'modules': path.normalize(root + '/modules/')
        },
        load: function(name, where) {
          console.log("" + this.paths[where] + name);
          if ((where != null) && where in this.paths) {
            return require("" + this.paths[where] + name);
          } else {
            return require(name);
          }
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
      factoryChannel.subscribe('class.created', function(data) {
        if (data["class"] != null) {
          if ((data["class"].$singleton === true) || (data["class"].$global === true)) {
            _this[data.name] = data["class"];
          } else if (data["class"].$initialize != null) {
            _this[data.name] = data["class"].create(data["class"].$initialize);
          }
          return _this.events.publish('class.created', data);
        }
      });
      toPath = function(item) {
        var obj, x, _i, _len;
        obj = _this.classes;
        if (_.isArray(item)) {
          for (_i = 0, _len = item.length; _i < _len; _i++) {
            x = item[_i];
            if (obj[x] != null) {
              obj = obj[x];
            }
          }
          return obj;
        } else if (_.isString(item)) {
          if (item.indexOf('.') > -1) {
            return toPath(item.split('.'));
          }
        } else {
          return obj;
        }
      };
      _this.implement({
        factory: Factory(_this.classes, factoryChannel),
        controller: function(name) {
          return toPath(name);
        },
        module: function(name) {
          return toPath(name);
        },
        model: function(name) {
          return toPath(name);
        },
        route: function(name) {
          return toPath(name);
        }
      });
      readdir = function(path, ext) {
        if (ext == null) {
          ext = '';
        }
        return _(fs.readdirSync(_this.paths[path] + ext)).each(function(file) {
          return _this.load(file, path);
        });
      };
      _this.load('bootstrap', 'app');
    };
    return {
      init: init
    };
  });
  return sx.init();
};
