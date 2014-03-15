module.exports = {
  $deps: [
    {
      'e': ['eventemitter2', 'EventEmitter2']
    }
  ],
  $static: {
    $setup: function() {
      return this.$implement(this.$.e, true);
    }
  }
};
