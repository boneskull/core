module.exports = {
  $deps: [
    'Utils', {
      '_s': 'underscore.string'
    }
  ],
  $static: {
    controllers: {},
    factory: function() {}
  },
  error: function(path) {
    throw new Error(this.$.Utils.sprintf('The requested URL %s was not found on this server.', path));
  },
  after: function(req, res) {},
  before: function(req, res) {},
  execute: function(req, res) {
    var action, _ref;
    this.before(req, res);
    if ((req != null ? (_ref = req.params) != null ? _ref.action : void 0 : void 0) != null) {
      action = "action" + (this.$._s.capitalize(req.params.action));
      if (this[action] != null) {
        this[action](req, res);
      } else {
        this.error(req.path);
      }
    } else {
      this.error(req.path);
    }
    this.after(req, res);
  }
};
