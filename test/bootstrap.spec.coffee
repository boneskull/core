def = require '../lib/system/classes/bootstrap.js'

Bootstrap = factory('bootstrap',  def)

module.exports = {
  'bootstrap': {
    'setPaths modifies the passed object': ->
      out = {}
      Bootstrap.setPaths('invalid', out)
      sep = Bootstrap.$.path.sep

      expect(out).to.eql({paths: {
        root   : "invalid#{sep}"
        system : "invalid#{sep}system#{sep}"
        app    : "invalid#{sep}app#{sep}"
        modules: "invalid#{sep}modules#{sep}"
      }})

  }
}