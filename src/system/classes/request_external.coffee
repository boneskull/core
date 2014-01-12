module.exports = {
  $deps: [
    'Response'
    {'request': 'request'}
  ]
  $extend: 'RequestCommon'
  $static: {
    execute: (request) ->
      d = @_defer()
      d.promise
  }
}