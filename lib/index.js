trycatch = require('trycatch');
var path;

trycatch.configure({
  colors: {
    node: 'none',
    node_modules: false,
    'default': 'yellow'
  }
});

path = require('path');

global.sx = require(path.normalize(__dirname + '/system/core/sx'));

sx.setPath(path.normalize(__dirname));
