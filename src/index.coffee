# try catch module needs to be before anything else
`trycatch = require('trycatch');`

trycatch.configure
  colors:
    node        : 'none'
    node_modules: false
    default     : 'yellow'

`path = require('path');`
`fs = require('fs');`
`Lazy = require('lazy.js');`
`_ = require('lodash');`
`postal = require('postal')(_);`
`Class = require('es5class');`
`_s = require('underscore.string');`

require(path.normalize(__dirname + '/system/classes/sx'))(__dirname)
