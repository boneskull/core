module.exports = {
  $deps: ['Utils'],
  $static: {
    execute: function() {
      throw new Error('RequestCommon class "execute" method must be overriden');
    }
  }
};
