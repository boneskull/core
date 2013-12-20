module.exports = {
  $deps: [
    {'_': 'lodash'}
  ]

  $static: {
    $setup: (sx) ->
      @config = sx.loadConfig('bootstrap').env(process.env.NODE_ENV || 'development')
  }

  construct: ->

}