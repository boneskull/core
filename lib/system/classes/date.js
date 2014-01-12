module.exports = {
  $deps: [
    {
      'moment': 'moment'
    }, {
      'timezone': 'moment-timezone'
    }
  ],
  $static: {
    $setup: function() {
      this.$implement(this.$.moment);
      return this.$implement(this.$.timezone);
    }
  }
};
