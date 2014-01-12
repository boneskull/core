module.exports = {
  $deps: [
    {
      'Q': 'q'
    }
  ],
  $static: {
    _defer: function() {
      return this.$.Q.defer();
    },
    execute: function() {
      throw new Error('RequestCommon class "execute" method must be overriden');
    }
  }
};
