module.exports = {
  $deps: [
    {'x': 'express'}
  ]
  $static: {
    $setup: ->
      @$implement(@$.x.response)

    factory: (obj = {}) ->
      # much faster than instantiation
      obj.__proto__ = @
      obj
  }
}