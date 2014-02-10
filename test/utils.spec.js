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
    'wrapConditionalPromise': function(done) {
      var obj;
      obj = {
        testing: function(callback) {
          return callback(null, 'ok');
        },
        testing2: function(value, callback) {
          return callback(null, value);
        },
        testing3: function(value, value2, callback) {
          return callback(null, {
            value: value,
            value2: value2
          });
        },
        testing4: function(callback) {
          return callback('fail');
        },
        testing5: function() {
          return true;
        }
      };
      Utils.wrapConditionalPromise(obj, 'testing');
      Utils.wrapConditionalPromise(obj, 'testing2');
      Utils.wrapConditionalPromise(obj, 'testing3');
      Utils.wrapConditionalPromise(obj, 'testing4');
      Utils.wrapConditionalPromise(obj, 'testing5', true);
      return obj.testing(function() {
        expect(arguments).to.eql({
          0: null,
          1: 'ok'
        });
        return obj.testing().then(function(res) {
          return expect(res).to.be('ok');
        }).done(function() {
          return obj.testing2('value', function(err, result) {
            expect(err).to.be(null);
            expect(result).to.be('value');
            return obj.testing2('value').then(function(value) {
              return expect(value).to.be('value');
            }).done(function() {
              return obj.testing3('1', '2', function(err, result) {
                expect(err).to.be(null);
                expect(result).to.eql({
                  value: '1',
                  value2: '2'
                });
                return obj.testing3('1', '2').then(function(res) {
                  return expect(res).to.eql({
                    value: '1',
                    value2: '2'
                  });
                }).done(function() {
                  return obj.testing4(function(err, result) {
                    expect(err).to.be('fail');
                    return obj.testing4().fail(function(err) {
                      return expect(err).to.be('fail');
                    }).done(function() {
                      return obj.testing5().done(function(value) {
                        expect(value).to.be(true);
                        return done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
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
