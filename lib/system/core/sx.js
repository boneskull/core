var ES5Class, Factory, app, fs, glob, path, postal, _, _s;

Factory = require('./factory');

app = require('express')();

path = require('path');

fs = require('fs');

glob = require('glob');

_ = require('lodash');

_s = require('underscore.string');

postal = require('postal')(_);

ES5Class = require('es5class');

module.exports = ES5Class.define('sx', {}, function() {
  var classes, dependencyLoader, init, setPaths, sxChannel,
    _this = this;
  sxChannel = postal.channel('sx');
  init = function() {
    var loaddir;
    loaddir = function(spath, ext) {
      if (ext == null) {
        ext = '';
      }
      return _(fs.readdirSync(_this.paths[spath] + ext)).each(function(file) {
        return _this.load(path.normalize(ext + '/' + file), spath);
      });
    };
    loaddir('system', 'classes');
    return _this.load('bootstrap');
  };
  setPaths = function(root) {
    var normalize;
    normalize = function(_path) {
      return path.normalize(root + _path);
    };
    _this.implement({
      paths: {
        root: normalize('/'),
        system: normalize('/system/'),
        app: normalize('/app/'),
        "public": normalize('/public/'),
        modules: normalize('/modules/')
      }
    });
  };
  classes = {};
  dependencyLoader = function(data) {
    var dep, dependencies, i, key, loaded, _ref;
    if (data["class"] != null) {
      if ((data["class"].$singleton === true) || (data["class"].$global === true)) {
        _this[data.name] = data["class"];
      } else if (data["class"].$initialize != null) {
        _this[data.name] = data["class"].create(data["class"].$initialize);
      }
      if (data["class"].$deps && _.size(data["class"].$deps)) {
        dependencies = {};
        _ref = data["class"].$deps;
        for (key in _ref) {
          dep = _ref[key];
          if (_.isString(dep)) {
            if (classes[dep]) {
              dependencies[dep] = classes[dep];
            } else {
              if (loaded = _this.load(dep)) {
                dependencies[dep] = loaded;
              } else {
                throw new Error(_s.sprintf('Invalid dependency on %s: %s', data.name, dep));
              }
            }
          } else if (_.isPlainObject(dep)) {
            for (key in dep) {
              i = dep[key];
              if (_.isArray(i)) {
                dependencies[key] = require(i[0])[i[1]];
              } else {
                dependencies[key] = require(i);
              }
            }
          } else {
            throw new Error('$deps must be an array of strings or objects');
          }
        }
        data["class"].$ = data["class"].prototype.$ = dependencies;
      }
      return _this.events.publish('class.created', data);
    }
  };
  return {
    classes: classes,
    modules: {},
    controllers: {},
    routes: {},
    models: {},
    configs: {},
    _toPath: function(item, type) {
      var obj, x, _i, _len;
      if (type == null) {
        type = 'classes';
      }
      obj = this[type];
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
    },
    controller: function(name) {
      return this._toPath(name);
    },
    module: function(name) {
      return this._toPath(name);
    },
    model: function(name) {
      return this._toPath(name);
    },
    route: function(name) {
      return this._toPath(name);
    },
    config: function(name) {
      return this._toPath(name);
    },
    app: app,
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
    },
    factory: Factory(classes, dependencyLoader),
    setPaths: setPaths,
    init: init,
    load: function(name, where) {
      var declaration, ret, v, _i, _len, _path, _ref, _ret;
      _path = false;
      if (where === void 0) {
        ret = false;
        _ref = ['system', 'modules', 'app'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          if ((_ret = this.load(name, v)) !== false) {
            ret = _ret;
          }
        }
        return ret;
      } else {
        _path = where in this.paths ? path.normalize("" + this.paths[where] + "classes/" + (name.toLowerCase()) + ".js") : false;
      }
      if (_path && fs.existsSync(_path)) {
        declaration = require(_path);
        return this.factory(name, declaration);
      }
      return false;
    }
  };
});
