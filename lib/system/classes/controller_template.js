module.exports = {
  $deps: ['View'],
  $extend: 'Controller',
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
