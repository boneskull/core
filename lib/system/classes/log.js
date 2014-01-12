module.exports = {
  $deps: [
    {
      'winston': 'winston'
    }
  ],
  $static: {
    $setup: function(sx) {
      this._config = sx.config('log').env(process.env.NODE_ENV || 'development');
      this.$implement(this.$.winston, true);
    }
  }
};
