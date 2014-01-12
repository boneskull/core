module.exports = {
  $deps: [
    {'e': ['eventemitter3','EventEmitter']}
  ]
  $static: {
    $setup: ->
      @$implement(@$.e, true)
  }
}