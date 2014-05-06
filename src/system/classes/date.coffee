module.exports = {
  $deps: [
    {'moment':'moment'}
    {'timezone':'moment-timezone'}
  ]
  $static: {
    $setup: ->
      @$implement(@$.moment)
      @$implement(@$.timezone)
  }
}