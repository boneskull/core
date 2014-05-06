module.exports = {
  $deps: [
    {'winston':'winston'}
  ]
  $static: {
    $setup: (sx) ->
      @_config = sx.config('log').env()
      @$implement(@$.winston, true)

      return
  }
}