module.exports = {
  $deps: [
    {'Q': 'q'}
  ]
  $static: {
    _defer: ->
      @$.Q.defer()

    execute: ->
      throw new Error('RequestCommon class "execute" method must be overriden')
  }
}