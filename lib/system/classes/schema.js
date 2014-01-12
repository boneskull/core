module.exports = {
  $deps: [
    {
      'jugglingdb': 'jugglingdb'
    }
  ],
  $static: {
    $setup: function(sx) {
      this.config = sx.config('database').env(process.env.NODE_ENV || 'development');
      this.Schema = this.$.jugglingdb.Schema;
    },
    get: function(name) {
      if (this.schemas[name] != null) {
        return this.schemas[name];
      }
      if (!this.config.get(name) && name !== 'memory') {
        throw new Error('No setting for that schema');
      }
      return this.schemas[name] = new this.Schema(name, this.config.get(name));
    },
    schemas: {}
  }
};
