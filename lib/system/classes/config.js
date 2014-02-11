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
    this.envmode = false;
    this.data = this.$._.isPlainObject(data) ? data : {};
  },
  clone: function(part) {
    var data;
    if (part == null) {
      part = false;
    }
    if (part === false) {
      return this.$._.cloneDeep(this.data);
    } else if (data = this.get(part)) {
      return this.$._.cloneDeep(data);
    }
  },
  set: function(name, value) {
    if (!name) {
      return this;
    }
    name = this._convert(name);
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
  _getParts: function(str) {
    return str.replace(/\\\./g, '\uffff').split('.').map(function(s) {
      return s.replace(/\uffff/g, '.');
    });
  },
  _convert: function(name) {
    if (this.$._.isArray(name)) {
      name = name.join('.');
    }
    return name;
  },
  unset: function(name) {
    var obj, part, parts;
    if (name = this._convert(name)) {
      if (this.isset(name)) {
        obj = this.data;
        parts = this._getParts(name);
        if (parts.length === 1) {
          delete this.data[name];
        } else {
          while (typeof obj === 'object' && parts.length) {
            part = parts.shift();
            if (parts.length === 0) {
              delete obj[part];
              break;
            } else {
              obj = obj[part];
            }
          }
        }
      }
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
    name = this._convert(name);
    if (this.isset(name)) {
      return this.$.g.get(this.data, name);
    } else {
      return inexistant;
    }
  },
  isset: function(name) {
    name = this._convert(name);
    return this.$.g.exists(this.data, name);
  },
  env: function(name) {
    if (name == null) {
      name = process.env.NODE_ENV || 'development';
    }
    if ((this.data['*'] == null) || ((name == null) || !(this.data[name] != null))) {
      return this;
    }
    this.envmode = name;
    this.wipe(this.$._.merge(this.data['*'], this.data[name]));
    return this;
  }
};
