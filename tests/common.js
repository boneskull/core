var sx = require('../lib/system/core/sx.js');

expect = require('expect.js');
fs = require('fs');
sinon = require('sinon');
factory = sx.factory;
var path = require('path');

sx.setPaths(path.normalize(__dirname + '/../lib'));