module.exports = {
  $singleton: true
  $deps: [
    {'path': 'path'}
    {'_': 'lodash'}
  ]

  $setup: (sx) ->
    #@config = sx.config('bootstrap').env(process.env.NODE_ENV || 'development')

    return

  setPaths: (root, out) ->
    normalize = (_path) =>
      @$.path.normalize(root + _path)

    @$._.merge(out, {
      paths:
        root   : normalize('/')
        system : normalize('/system/')
        app    : normalize('/app/')
        modules: normalize('/modules/')
    }, @$._.defaults)

    return

  start: (root, out, config, main = true) ->
    setPaths(root, out)

    return

}