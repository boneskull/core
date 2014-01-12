module.exports = {
  $deps: [
    {'_': 'lodash'}
  ]

  $static: {
    $setup: (sx) ->
      @config = sx.config('bootstrap').env(process.env.NODE_ENV || 'development')

      return
  }

  construct: (config) ->


}