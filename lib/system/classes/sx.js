var Lazy, fs, jsface, path, sx;

fs = require('fs');

path = require('path');

Lazy = require('lazy.js');

jsface = require('jsface');

module.exports = sx = jsface.Class(function() {
  var init, loadClass, loadModule;
  loadModule = function() {};
  loadClass = function(className) {};
  init = function(root) {
    jsface.extend(sx, {
      extend: jsface.extend,
      paths: {
        'system': path.normalize(root + '/system/'),
        'app': path.normalize(root + '/app/'),
        'public': path.normalize(root + '/public/'),
        'modules': path.normalize(root + '/modules/')
      },
      modules: {},
      factory: loadClass
    });
  };
  return {
    $singleton: true,
    init: init
  };
});
