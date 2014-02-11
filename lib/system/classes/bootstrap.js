module.exports = {
  $singleton: true,
  $deps: [
    {
      'path': 'path'
    }, {
      '_': 'lodash'
    }
  ],
  $setup: function(sx) {},
  setPaths: function(root, out) {
    var normalize;
    normalize = (function(_this) {
      return function(_path) {
        return _this.$.path.normalize(root + _path);
      };
    })(this);
    this.$._.merge(out, {
      paths: {
        root: normalize('/'),
        system: normalize('/system/'),
        app: normalize('/app/'),
        modules: normalize('/modules/')
      }
    }, this.$._.defaults);
  },
  start: function(root, out, config, main) {
    if (main == null) {
      main = true;
    }
    setPaths(root, out);
  }
};
