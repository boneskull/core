module.exports = {
  $deps: [
    {
      'winston': 'winston'
    }
  ],
  $static: {
    $setup: function(sx) {
      this._config = sx.config('log').env();
      this.$implement(this.$.winston, true);
    }
  }
};
