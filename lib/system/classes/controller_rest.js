module.exports = {
  $extend: 'Controller',
  $static: {
    $setup: function(sx) {
      if (this.$className !== 'ControllerRest') {
        this.$super(sx);
      }
    }
  },
  find: function(req, res) {},
  insert: function(req, res) {},
  update: function(req, res) {},
  destroy: function(req, res) {}
};
