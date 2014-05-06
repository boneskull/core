module.exports = {
  $deps: [
    {'e': ['eventemitter2','EventEmitter2']}
  ]
  $static: {
    $setup: ->
      @$implement(@$.e, true)
  }
}