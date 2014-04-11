
var Utils;

Utils = factory('utils', require('../lib/system/classes/utils.js'));

module.exports = {

  'utils': {

    'sprintf': function (){
      expect(Utils.sprintf).to.be.ok();
      expect(Utils.vsprintf).to.be.ok();
      expect(Utils.sprintf('Hello %s', 'Juarez')).to.equal('Hello Juarez');
      return expect(Utils.vsprintf('Hello %s', ['Juarez'])).to.equal('Hello Juarez');
    },

    'strReplace': function (){
      var str;
      str = Utils.strReplace;
      expect(str).to.be.ok();
      return expect(str('a', 'b', 'aabbcc')).to.equal('bbbbcc');
    },

    'Promise': function (done){
      var d = Utils.Promise.defer();

      d.resolve(true);

      d.promise.done(function (val){
        expect(val).to.be(true);
        done();
      });
    }

  }
};
