var
  sx = require('../lib/system/core/sx');

expect = require('expect.js');
fs = require('fs');
sinon = require('sinon');
factory = sx.factory;
var path = require('path');
var bootstrap = factory('bootstrap', require('../lib/system/classes/bootstrap'));

bootstrap.setPaths(path.normalize(__dirname + '/../lib'), sx);