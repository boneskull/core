module.exports = {
  $deps: [
    'Schema', 'Utils', 'Log', {
      'Q': 'q'
    }
  ],
  $static: {
    $setup: function(sx) {
      var modelName;
      modelName = this.$className;
      if (modelName !== 'Model') {
        sx.models[modelName] = new this;
      }
    },
    factory: function(type, name, definition) {
      return new this(type, name, definition);
    }
  },
  getSchema: function(type) {
    if (type == null) {
      type = 'memory';
    }
    return this.$.Schema.get(type);
  },
  _applyRelation: function(type) {
    var isArray, modelName;
    if (this.$relations[type] != null) {
      isArray = false;
      modelName = this.$.Utils.isArray(this.$relations[type]) ? (isArray = true, this.$relations[type][0]) : this.$relations[type];
      if (this.db.models[modelName] != null) {
        this.model[type].apply(this.model, isArray ? this.$relations[type] : [this.$relations[type]]);
      } else {
        throw new Error(this.$.Utils.sprintf('Model "%s" doesnt exists in "%s" of model "%s"', modelName, type, this.model.name));
      }
    }
  },
  construct: function(type, name, definition) {
    var d, k, v, _ref,
      _this = this;
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
      this._applyRelation('belongsTo');
      this._applyRelation('hasMany');
      this._applyRelation('hasAndBelongsToMany');
    }
    if (d != null) {
      d.promise.done(function(cb) {
        cb.call(_this, _this.model);
        d = null;
      });
      if (d.promise.inspect() !== 'fulfilled') {
        d = null;
      }
    }
    this.$.Utils.promesifyAll(this.model, this);
  },
  createNew: function(data) {
    var k, model, v, _ref;
    model = {
      model: new this.model(data, this.db)
    };
    _ref = this.model.properties;
    for (k in _ref) {
      v = _ref[k];
      if (k !== 'model') {
        Object.defineProperty(model, k, {
          get: (function(k) {
            return function() {
              return this.model[k];
            };
          })(k),
          set: (function(k) {
            return function(value) {
              this.model[k] = value;
            };
          })(k),
          enumerable: true
        });
      }
    }
    this.$.Utils.promesifyAll(model.model, model);
    return model;
  }
};
