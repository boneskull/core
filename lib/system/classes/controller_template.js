module.exports = {
  $deps: ['View'],
  $extend: 'Controller',
  $static: {
    $setup: function(sx) {
      if (this.$className !== 'ControllerTemplate') {
        this.$super(sx);
      }
    }
  },
  before: function(req, res) {
    this.$super(req, res);
    if (this.autoRender) {
      this.template = this.$.View.factory();
    }
  },
  after: function(req, res) {
    this.$super(req, res);
  },
  autoRender: true,
  template: 'template'
};
