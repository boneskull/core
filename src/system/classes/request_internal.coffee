module.exports = {
  $deps: [
    'Response'
  ]
  $extend: 'RequestCommon'
  $static: {
    execute: (request) ->
      d = @_defer()
      d.promise
  }
}