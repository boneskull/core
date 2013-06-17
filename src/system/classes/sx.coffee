# common stuff
fs = require 'fs'
path = require 'path'

# needed globals
Lazy = require 'lazy.js'
jsface = require 'jsface'

module.exports = sx = jsface.Class(->
  loadModule = ->

  loadClass = (className) ->
    
    
  init = (root) ->
    jsface.extend(sx, 
      extend : jsface.extend
      paths  :
        'system' : path.normalize(root + '/system/')
        'app'    : path.normalize(root + '/app/')
        'public' : path.normalize(root + '/public/')
        'modules': path.normalize(root + '/modules/')
      modules: {}
      factory: loadClass
    )
    
    
    
    return

  {
    $singleton: true
    init      : init
  }
)
