module.exports = {
  $deps: [
    {
      '_': 'lodash'
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
    if (name instanceof this.$class) {
      this.data = this.$._.merge(this.data, name.data);
    } else if (this.$._.isString(name)) {
      this.data[name] = value;
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
    if (this.data[name] != null) {
      delete this.data[name];
    }
    return this;
  },
  get: function(name, inexistant) {
    if (inexistant == null) {
      inexistant = null;
    }
    if (this.data[name] != null) {
      return this.data[name];
    } else {
      return inexistant;
    }
  },
  isset: function(name) {
    return typeof this.data[name] !== 'undefined';
  },
  env: function(name) {
    if ((this.data['*'] == null) && (this.data[name] == null)) {
      return this;
    }
    this.wipe(this.$._.defaults(this.data[name], this.data['*'] != null ? this.data['*'] : {}));
    return this;
  }
};
