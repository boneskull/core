module.exports = {
  $deps: ['Response'],
  $extend: 'RequestCommon',
  $static: {
    execute: function(request) {
      var d;
      d = this._defer();
      return d.promise;
    }
  }
};
