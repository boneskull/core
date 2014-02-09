var Utils;

Utils = factory('utils', require('../lib/system/classes/utils.js'));

module.exports = {
  'utils': {
    'sprintf': function() {
      expect(Utils.sprintf).to.be.ok();
      expect(Utils.vsprintf).to.be.ok();
      expect(Utils.sprintf('Hello %s', 'Juarez')).to.equal('Hello Juarez');
      return expect(Utils.vsprintf('Hello %s', ['Juarez'])).to.equal('Hello Juarez');
    },
    'strReplace': function() {
      var str;
      str = Utils.strReplace;
      expect(str).to.be.ok();
      return expect(str('a', 'b', 'aabbcc')).to.equal('bbbbcc');
    },
    'promesifyAll': function() {
      var dest, source;
      source = {
        one: function(val, cb) {
          if (!val) {
            return cb('error');
          }
          return cb(null, val);
        },
        two: function(val, val2, cb) {
          if (!val || !val2) {
            return cb('error');
          }
          return this.one(val + val2, cb);
        }
      };
      source.two('a', 'b', function(err, val) {
        return expect(val).to.equal('ab');
      });
      dest = {};
      Utils.promesifyAll(source, dest);
      expect(dest.two).to.be.ok();
      expect(dest.one).to.be.ok();
      dest.one('value').then(function(value) {
        return expect(value).to.be('value');
      });
      dest.two('1', '2').then(function(value) {
        return expect(value).to.equal('12');
      });
      dest.two().fail(function(err) {
        return expect(err).to.be('error');
      });
      dest = {};
      Utils.promesifyAll(source, dest, ['one']);
      expect(dest.two).to.not.be.ok();
      return expect(dest.one).to.be.ok();
    }
  }
};
