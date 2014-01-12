sx = require '../lib/system/core/sx.js'

module.exports = {
  'sx':
    'should have the system paths defined and valid': ->
      expect(sx.paths).to.not.be.empty()
      expect(sx.paths.system).to.be.ok()

    'load': ->

    'loadConfig': ->
}