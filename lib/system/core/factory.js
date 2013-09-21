module.exports = function(repository, channel) {
  var apply, create, extend;
  apply = function(name, declaration, createdClass) {
    var clss, existing, extend, _i, _len, _ref;
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
    if (declaration.$singleton === true) {
      createdClass.implement(declaration);
    } else {
      createdClass.include(declaration);
    }
    repository[name] = createdClass;
    if (channel != null) {
      channel.publish('class.created', {
        "class": repository[name],
        name: name
      });
    }
    return createdClass;
  };
  create = function(name, declaration) {
    if (declaration == null) {
      declaration = {};
    }
    return apply(name, declaration);
  };
  extend = function(name, declaration) {
    if (declaration == null) {
      declaration = {};
    }
    return apply(name, declaration, repository[name]);
  };
  return function(name, declaration) {
    var out;
    if (declaration == null) {
      declaration = {};
    }
    name = _s.classify(name.replace(/\-/g, ' '));
    if (arguments.length === 1) {
      out = !(name in repository) ? create(name) : repository[name];
    } else {
      out = name in repository ? extend(name, declaration) : create(name, declaration);
    }
    return out;
  };
};
