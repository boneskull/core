var __hasProp = {}.hasOwnProperty;

module.exports = {
  $deps: [
    'Schema', 'Utils', 'Log', {
      'Q': 'q'
    }, {
      'g': 'getobject'
    }
  ],
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
    var d, func, i, k, nproto, proto, v, _i, _j, _len, _len1, _ref, _ref1;
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
      d = this.$.Q.defer();
      definition = definition.call(this, d.resolve);
    }
    this.model = this.db.define(name, definition);
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
      d.promise.done((function(_this) {
        return function(cb) {
          cb.call(_this, _this.model);
          d = null;
        };
      })(this));
      if (d.promise.inspect() !== 'fulfilled') {
        d = null;
      }
    }
    nproto = ['update', 'create', 'upsert', 'updateOrCreate', 'findOrCreate', 'exists', 'find', 'all', 'findOne', 'destroyAll', 'count'];
    for (_i = 0, _len = nproto.length; _i < _len; _i++) {
      i = nproto[_i];
      this.$.Utils.wrapConditionalPromise(this.model, i);
    }
    proto = ['save', 'destroy', 'updateAttribute', 'updateAttributes', 'reload'];
    for (_j = 0, _len1 = proto.length; _j < _len1; _j++) {
      i = proto[_j];
      this.$.Utils.wrapConditionalPromise(this.model.prototype, i);
    }
    _ref1 = this.model;
    for (name in _ref1) {
      if (!__hasProp.call(_ref1, name)) continue;
      func = _ref1[name];
      if (typeof func === 'function') {
        this[name] = (function(func, model) {
          return function() {
            return func.apply(model, arguments);
          };
        })(func, this.model);
      }
    }
  }
};
