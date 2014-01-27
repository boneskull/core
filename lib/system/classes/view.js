module.exports = {
  $deps: [
    'Utils', {
      'Q': 'q'
    }, {
      'p': 'path'
    }, {
      'fs': 'fs'
    }, {
      '_s': 'underscore.string'
    }, {
      't': 'transformers'
    }
  ],
  $static: {
    $setup: function(sx) {
      var viewName;
      viewName = this.$className;
      if (viewName !== 'View') {
        sx.views[viewName] = new this;
      }
    },
    factory: function(name, data, type) {
      if (((name != null ? name.$className : void 0) != null) && name.$className === 'Request') {
        return true;
      }
    }
  },
  construct: function(path, opts) {
    var base, extension, index, sep,
      _this = this;
    if (opts == null) {
      opts = {};
    }
    this.path = this.$.p.normalize(path);
    extension = opts.type || path.substr((~-path.lastIndexOf(".") >>> 0) + 2);
    if (this.$.t[extension] == null) {
      throw new Error(this.$.Utils.sprintf('Invalid view extension "%s"', extension));
    }
    this.engine = this.$.t[extension];
    this.engine.render = this.$.Q.nbind(this.engine.render, this.$.t[extension]);
    this.load(function(str) {
      _this.content = str;
      if (opts.ready != null) {
        return typeof opts.ready === "function" ? opts.ready() : void 0;
      }
    });
    path = this.path.toLowerCase();
    if (opts.base != null) {
      base = this.$.p.normalize(opts.base);
      if ((index = path.indexOf(base)) !== -1) {
        path = path.substr(index + base.length);
      }
    }
    if ((sep = path.indexOf(this.$.p.sep)) !== -1 && (sep === 0)) {
      this.name = path.substr(sep + 1);
    } else {
      this.name = path;
    }
    this.name = this.name.replace(/\\/g, '/');
  },
  load: function(cb) {
    var _this = this;
    return this.$.fs.readFile(this.path, function(err, content) {
      if (err) {
        throw new Error(_this.$.Utils.sprintf('View "%s" doesnt exists', _this.path));
      }
      return cb(content.toString());
    });
  },
  render: function(data) {
    if (data == null) {
      data = {};
    }
    return this.engine.render(this.content, data);
  }
};
