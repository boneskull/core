module.exports = {
  $extend: 'Controller',
  $static: {
    $setup: function(sx) {
      if (this.$className !== 'ControllerRealtime') {
        this.$super(sx);
      }
    }
  },
  execute: function(req, res) {
    this.$super(req, res);
  }
};
