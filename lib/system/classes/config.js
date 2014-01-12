module.exports = {
  $deps: [
    {
      '_': 'lodash'
    }, {
      'g': 'getobject'
    }
  ],
  construct: function(name, data) {
    this.name = name;
    return this.data = this.$._.isPlainObject(data) ? data : {};
  },
  clone: function() {
    return this.$._.cloneDeep(this.data);
  },
  set: function(name, value) {
    if (!name) {
      return this;
    }
    if (this.$._.isArray(name)) {
      name = name.join('.');
    }
    if (name instanceof this.$class) {
      this.data = this.$._.merge(this.data, name.data);
    } else if (this.$._.isString(name)) {
      this.$.g.set(this.data, name, value);
    } else {
      this.data = this.$._.merge(this.data, name);
    }
    return this;
  },
  wipe: function(data) {
    if (data == null) {
      data = {};
    }
    return this.data = data;
  },
  unset: function(name) {
    if ((name != null) && (this.data[name] != null)) {
      delete this.data[name];
    }
    return this;
  },
  get: function(name, inexistant) {
    if (inexistant == null) {
      inexistant = null;
    }
    if (!name) {
      return inexistant;
    }
    if (this.$._.isArray(name)) {
      name = name.join('.');
    }
    if (this.$.g.exists(this.data, name)) {
      return this.$.g.get(this.data, name);
    } else {
      return inexistant;
    }
  },
  isset: function(name) {
    return typeof this.data[name] !== 'undefined';
  },
  env: function(name) {
    if (name == null) {
      name = process.env.NODE_ENV;
    }
    if ((this.data['*'] == null) || ((name == null) || !(this.data[name] != null))) {
      return this;
    }
    this.wipe(this.$._.merge(this.data['*'], this.data[name]));
    return this;
  }
};
