var ES5Class, classify, _, _s;

ES5Class = require('es5class');

_s = require('underscore.string');

_ = require('lodash');

module.exports = function(repository, callback) {
  'use strict';
  var apply;
  apply = function(name, declaration, createdClass, to) {
    var clss, existing, extend, k, v, _i, _len, _ref, _ref1;
    extend = [];
    existing = createdClass != null;
    if (createdClass == null) {
      createdClass = ES5Class.define(name);
    }
    if (_.isFunction(declaration)) {
      declaration = declaration.call(createdClass, createdClass.$parent);
    }
    if (existing && createdClass.$singleton) {
      declaration.$singleton = true;
    }
    if (declaration.$extend != null) {
      if (!_.isArray(declaration.$extend)) {
        declaration.$extend = [declaration.$extend];
      }
      _ref = declaration.$extend;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        clss = _ref[_i];
        if (_.isString(clss)) {
          if (clss in repository) {
            extend.push(repository[clss]);
            if (repository[clss].$singleton != null) {
              declaration.$singleton = true;
            }
          }
        } else if (clss.$className) {
          extend.push(clss);
          if (clss.$singleton) {
            declaration.$singleton = true;
          }
        }
      }
      delete declaration.$extend;
    }
    createdClass.implement(extend);
    if (declaration.$static) {
      createdClass.implement(declaration.$static);
      delete declaration.$static;
    }
    if (declaration.$deps) {
      _ref1 = declaration.$deps;
      for (k in _ref1) {
        v = _ref1[k];
        if (_.isString(declaration.$deps[k])) {
          declaration.$deps[k] = classify(v);
        }
      }
      createdClass.implement({
        $deps: declaration.$deps,
        $: {},
        prototype: {
          $deps: declaration.$deps,
          $: {}
        }
      });
    }
    delete declaration.$deps;
    if (declaration.$singleton === true) {
      createdClass.implement(declaration);
    } else {
      createdClass.include(declaration);
    }
    repository[name] = createdClass;
    if (typeof callback === "function") {
      callback({
        "class": repository[name],
        name: name,
        to: to
      });
    }
    return createdClass;
  };
  return function(name, declaration, to) {
    var create, extend, out;
    if (declaration == null) {
      declaration = {};
    }
    name = classify(name);
    create = function() {
      return apply(name, declaration, null, to);
    };
    extend = function() {
      return apply(name, declaration, repository[name], to);
    };
    if (arguments.length === 1) {
      out = !(name in repository) ? create() : repository[name];
    } else {
      out = name in repository ? extend() : create();
    }
    return out;
  };
};

module.exports.classify = classify = function(name) {
  return _s.classify(name.replace(/\-/g, ' '));
};
