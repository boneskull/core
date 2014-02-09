var sx;

sx = require('../lib/system/core/sx.js');

module.exports = {
  'sx': {
    'should have the system paths defined and valid': function() {
      expect(sx.paths).to.not.be.empty();
      return expect(sx.paths.system).to.be.ok();
    },
    'load': function() {},
    'loadConfig': function() {}
  }
};
