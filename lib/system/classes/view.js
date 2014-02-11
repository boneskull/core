module.exports = {
  $deps: [
    'Utils', {
      'p': 'path'
    }, {
      'fs': 'fs'
    }, {
      'c': 'consolidate'
    }
  ],
  $static: {
    views: {},
    factory: function(name, data, type) {
      if (((name != null ? name.$className : void 0) != null) && name.$className === 'Request') {
        return true;
      }
    }
  },
  construct: function(path, opts) {
    var base, extension, index, sep;
    if (opts == null) {
      opts = {};
    }
    this.path = this.$.p.normalize(path);
    extension = opts.type || path.substr((~-path.lastIndexOf(".") >>> 0) + 2);
    if (this.$.c[extension] == null) {
      throw new Error(this.$.Utils.sprintf('Invalid view extension "%s"', extension));
    }
    this.engine = this.$.c[extension];
    this.engine.render = this.$.Utils.$.Q.nbind(this.engine.render, this.$.c[extension]);
    this.load((function(_this) {
      return function(str) {
        _this.content = str;
        if (opts.ready != null) {
          return typeof opts.ready === "function" ? opts.ready() : void 0;
        }
      };
    })(this));
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
    this.$.fs.readFile(this.path, (function(_this) {
      return function(err, content) {
        if (err) {
          throw new Error(_this.$.Utils.sprintf('View "%s" doesnt exists', _this.path));
        }
        return cb(content.toString());
      };
    })(this));
  },
  render: function(data) {
    if (data == null) {
      data = {};
    }
    return this.engine.render(this.content, this.$.Utils.merge({
      filename: this.path,
      cache: 'memory'
    }, data));
  }
};
