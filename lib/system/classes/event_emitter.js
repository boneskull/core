module.exports = {
  $deps: [
    {
      'e': ['eventemitter3', 'EventEmitter']
    }
  ],
  $static: {
    $setup: function() {
      return this.$implement(this.$.e, true);
    }
  }
};
