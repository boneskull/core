var
  sx = require('../lib/system/core/sx');

expect = require('expect.js');
fs = require('fs');
sinon = require('sinon');
factory = sx.factory;
var path = require('path');
var bootstrap = factory('bootstrap', require('../lib/system/classes/bootstrap'));

fixtures = {
  path: path.join(__dirname, 'fixtures'),
  join: function(args, _path){
    return path.join.apply(null, (_path ? [this.path] : []).concat(args));
  },
  get: function(p, fromFile){
    p = p.constructor === Array ?
      path.join.apply(path, [this.path].concat(p)) :
      path.join(this.path, p);

    return fromFile === true ? fs.readFileSync(p): p;
  }
};

bootstrap.setPaths(path.normalize(__dirname + '/../lib'), sx);