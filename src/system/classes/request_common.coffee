module.exports = {
  $deps: [
    'Utils'
  ]
  $static: {
    execute: ->
      throw new Error('RequestCommon class "execute" method must be overriden')
  }
}