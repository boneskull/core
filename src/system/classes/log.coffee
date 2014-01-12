module.exports = {
  $deps: [
    {'winston':'winston'}
  ]
  $static: {
    $setup: (sx) ->
      @_config = sx.config('log').env(process.env.NODE_ENV || 'development')
      @$implement(@$.winston, true)

      return
  }
}