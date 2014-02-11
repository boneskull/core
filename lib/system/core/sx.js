var ES5Class, Factory, app, fs, getobject, glob, path, postal, _, _s;

Factory = require('./factory');

app = require('express')();

path = require('path');

fs = require('fs');

glob = require('glob');

_ = require('lodash');

_s = require('underscore.string');

postal = require('postal')(_);

ES5Class = require('es5class');

getobject = require('getobject');

module.exports = ES5Class.$define('sx', {}, function() {
  var classes, configs, dependencyLoader, sxChannel;
  sxChannel = postal.channel('sx');
  classes = {};
  configs = {};
  dependencyLoader = (function(_this) {
    return function(data, extend) {
      var dep, dependencies, i, k, key, loaded, v, _base, _dep, _ref, _ref1, _ref2;
      if (extend == null) {
        extend = false;
      }
      if (extend !== false) {
        if (data == null) {
          data = {};
        }
        if (classes[extend]) {
          data["class"] = classes[extend];
        } else if (loaded = _this.load(extend)) {
          data["class"] = loaded;
        }
        data.name = data["class"].$className;
      }
      if ((data != null ? data["class"] : void 0) != null) {
        if (data["class"].$singleton === true) {
          _this[data.name] = data["class"];
        }
        if (_.size(data["class"].$deps)) {
          dependencies = {};
          _ref = data["class"].$deps;
          for (key in _ref) {
            dep = _ref[key];
            if (_.isString(dep) || _.isArray(dep)) {
              _dep = _.isArray(dep) ? dep[dep.length - 1] : dep;
              if (classes[_dep]) {
                dependencies[_dep] = classes[_dep];
              } else {
                if (loaded = _this.load(dep)) {
                  dependencies[_dep] = loaded;
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
              throw new Error(_s.sprintf('$deps for %s must be an array of strings or objects', data.name));
            }
          }
          if (((_ref1 = data["class"].$parent) != null ? _ref1.$ : void 0) != null) {
            _ref2 = data["class"].$parent.$;
            for (k in _ref2) {
              v = _ref2[k];
              if (dependencies[k] == null) {
                dependencies[k] = v;
              }
            }
          }
          data["class"].$implement({
            $: dependencies
          }).$include({
            $: dependencies
          });
        }
        if (typeof (_base = data["class"]).$setup === "function") {
          _base.$setup(_this);
        }
        return data["class"];
      }
      return null;
    };
  })(this);
  return {
    classes: classes,
    modules: {},
    controllers: {},
    models: {},
    configs: configs,
    _toPath: function(item, type) {
      var cls, k, obj, v;
      switch (type) {
        case 'module':
        case 'model':
        case 'controller':
        case 'config':
          obj = this["" + type + "s"];
          break;
        default:
          throw new Error(_s.sprintf('Invalid _toPath type: %s', type));
      }
      if (_.isArray(item)) {
        for (k in item) {
          v = item[k];
          item[k] = _s.classify(v);
        }
        item = item.join('.');
      } else {
        item = _s.classify(item);
      }
      cls = getobject.get(obj, item);
      if (cls == null) {
        if (type === 'config') {
          return this.loadConfig("" + item);
        } else {
          item = Array.prototype.concat.apply(type, item.split('.'));
          return this.load(item);
        }
      } else {
        return cls;
      }
    },
    controller: function(name) {
      return this._toPath(name, 'controller');
    },
    module: function(name) {
      return this._toPath(name, 'module');
    },
    model: function(name) {
      return this._toPath(name, 'model');
    },
    config: function(name) {
      return this._toPath(name, 'config');
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
    factory: Factory(classes, dependencyLoader, this),
    _require: require,
    loadConfig: function(name, where) {
      var declaration, ret, v, _i, _len, _path, _ref, _ret;
      if (classes['Config'] == null) {
        this.load('Config');
      }
      if (where === void 0) {
        ret = false;
        _ref = ['system', 'modules', 'app'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          if ((_ret = this.loadConfig(name, v)) !== false) {
            ret = _ret;
          }
        }
        return ret;
      } else {
        if (where === 'modules') {

        } else {
          _path = where in this.paths ? path.normalize("" + this.paths[where] + "config/" + (name.toLowerCase()) + ".js") : false;
        }
      }
      if (_path && fs.existsSync(_path)) {
        declaration = this._require(_path);
        name = _s.classify(name);
        if (_.isFunction(declaration)) {
          declaration = declaration(this);
        }
        if (configs[name] == null) {
          configs[name] = classes.Config(name, declaration);
        } else {
          configs[name].set(declaration);
        }
        return configs[name];
      }
      return false;
    },
    load: function(name, where) {
      var cls, declaration, ret, tmpName, v, _i, _len, _path, _ref, _ret;
      _path = false;
      if (!name) {
        return false;
      }
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
        if (where === 'modules') {

        } else {
          if (_.isArray(name)) {
            name = name.join('/');
          }
          tmpName = false;
          if (name.indexOf('_') === -1) {
            name = name.replace(/[A-Z]/g, function(match, index) {
              if (index === 0) {
                return match;
              }
              if (name.charAt(index - 1) === '/') {
                return match;
              }
              return "_" + match;
            });
            if (name.indexOf('/') !== -1) {
              tmpName = name.split(/\//).pop();
            }
          } else {
            tmpName = Factory.classify(name);
          }
          _path = where in this.paths ? path.normalize("" + this.paths[where] + "classes/" + (name.toLowerCase()) + ".js") : false;
        }
      }
      if (_path && fs.existsSync(_path)) {
        declaration = this._require(_path);
        if (declaration !== void 0) {
          cls = this.factory(tmpName || name, declaration);
          return cls;
        }
      }
      return false;
    }
  };
});
