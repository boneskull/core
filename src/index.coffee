# try catch module needs to be before anything else
global.trycatch = require 'trycatch'

trycatch.configure(
  'colors':
    'node'        : 'none'
    'node_modules': false
    'default'     : 'yellow'
)

global.sx = require('./system/classes/sx')

sx.init(__dirname) 