var __hasProp = {}.hasOwnProperty;

module.exports = {
  $deps: ['Schema', 'Utils', 'Log'],
  $static: {
    models: {},
    factory: function(type, name, definition) {
      var model;
      model = new this(type, name, definition);
      this.$.Utils.assignObject(this.models, name.split(/\//g), model);
      return model;
    }
  },
  getSchema: function(type) {
    if (type == null) {
      type = 'memory';
    }
    return this.$.Schema.get(type);
  },
  _applyRelation: function(type, name) {
    var args, isArray, modelName;
    if (this.$relations[type] != null) {
      isArray = false;
      modelName = this.$.Utils.isArray(this.$relations[type]) ? (isArray = true, this.$relations[type][0]) : this.$relations[type];
      if (modelName.$class != null) {
        modelName = modelName.$class.$className;
      }
      if (this.db.models[modelName] != null) {
        args = [this.db.models[modelName]].concat((isArray ? this.$relations[type] : [this.$relations[type]]).slice(1));
        this.model[type].apply(this.model, args);
      } else {
        throw new Error(this.$.Utils.sprintf('Model "%s" doesnt exists in "%s" of model "%s"', modelName, type, name));
      }
    }
  },
  construct: function(type, name, definition) {
    var d, delegated, func, k, model, v, _ref, _ref1;
    if (name == null) {
      name = this.$class.$className;
    }
    if (this.$db) {
      type = this.$db;
    }
    if (this.$attrs != null) {
      definition = this.$attrs;
    }
    this.db = this.getSchema(type);
    this.Schema = this.$.Schema.Schema;
    if (!definition) {
      if (definition == null) {
        definition = {};
      }
    }
    if (this.$.Utils.isFunction(definition)) {
      d = this.$.Utils.Promise.defer();
      definition = definition.call(this, this.$.Utils.Curry.wrap(d.resolve, d));
    }
    model = this.model = this.db.define(name, definition);
    if (this.$functions != null) {
      _ref = this.$functions;
      for (k in _ref) {
        v = _ref[k];
        this.model.prototype[k] = v;
      }
    }
    if (this.$relations != null) {
      this._applyRelation('belongsTo', name);
      this._applyRelation('hasMany', name);
      this._applyRelation('hasAndBelongsToMany', name);
    }
    if (d != null) {
      d.promise.done(function(cb) {
        cb.call(this, model);
        d = null;
      });
    }
    delegated = this.$.Utils.Curry.delegate(this, 'model');
    _ref1 = this.model;
    for (name in _ref1) {
      if (!__hasProp.call(_ref1, name)) continue;
      func = _ref1[name];
      if (typeof func === 'function') {
        if (func.length === 0) {
          delegated.method({
            name: name,
            len: -1
          });
        } else {
          delegated.method(name);
        }
      } else {
        delegated.access(name);
      }
    }
  }
};
