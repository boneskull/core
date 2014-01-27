module.exports = {
  $extend: 'ControllerTemplate',
  $static: {
    $setup: function(sx) {
      if (this.$className !== 'ControllerAjax') {
        this.$super(sx);
      }
    }
  },
  execute: function(req, res) {
    this.$super(req, res);
  }
};
