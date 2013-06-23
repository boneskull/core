module.exports = function(repository, channel) {
  var apply, create, extend;
  apply = function(name, declaration, createdClass) {
    var clss, existing, inherits, _i, _len, _ref;
    inherits = [];
    existing = createdClass != null;
    if (existing && createdClass.$singleton) {
      declaration.$singleton = true;
    }
    if (declaration.$inherits != null) {
      if (!_.isArray(declaration.$inherits)) {
        declaration.$inherits = [declaration.$inherits];
      }
      _ref = declaration.$inherits;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        clss = _ref[_i];
        if (_.isString(clss)) {
          if (clss in repository) {
            inherits.push(repository[clss]);
            if (repository[clss].$singleton != null) {
              declaration.$singleton = true;
            }
          }
        } else if (clss.$className) {
          inherits.push(clss);
          if (clss.$singleton) {
            declaration.$singleton = true;
          }
        }
      }
      delete declaration.$inherits;
    }
    if (createdClass == null) {
      createdClass = Class.extend(name);
    }
    createdClass.implement(inherits);
    if (declaration.$singleton === true) {
      createdClass.implement(declaration);
    } else {
      createdClass.include(declaration);
    }
    repository[name] = createdClass;
    channel.publish('class.created', {
      "class": repository[name],
      name: name
    });
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
    name = _s.classify(name);
    if (arguments.length === 1) {
      if (!(name in repository)) {
        out = create(name);
      } else {
        out = repository[name];
      }
    } else {
      if (name in repository) {
        out = extend(name, declaration);
      } else {
        out = create(name, declaration);
      }
    }
    return out;
  };
};
