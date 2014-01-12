module.exports = {
  $deps: [
    {
      '_': 'lodash'
    }
  ],
  $static: {
    $setup: function(sx) {
      this.config = sx.config('bootstrap').env(process.env.NODE_ENV || 'development');
    }
  },
  construct: function(config) {}
};
