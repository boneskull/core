module.exports = {
  $deps: [
    {
      '_': 'lodash'
    }
  ],
  $static: {
    $setup: function(sx) {
      return this.config = sx.loadConfig('bootstrap').env(process.env.NODE_ENV || 'development');
    }
  },
  construct: function() {}
};
