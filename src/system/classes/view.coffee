module.exports = {
  $deps: [
    'Utils'
    {'Q':'q'}
    {'p': 'path'}
    {'fs': 'fs'}
    {'_s':'underscore.string'}
    {'t': 'transformers'}
  ]
  $static: {
    $setup: (sx) ->
      viewName = @$className
      if viewName isnt 'View'
        sx.views[viewName] = new @

      return

    factory: (name, data, type) ->
      if name?.$className? and name.$className is 'Request'
        true
  }
  construct: (path, opts = {}) ->
    @path = @$.p.normalize(path)

    extension = opts.type or path.substr((~-path.lastIndexOf(".") >>> 0) + 2)

    if not @$.t[extension]?
      throw new Error(@$.Utils.sprintf('Invalid view extension "%s"', extension))

    @engine = @$.t[extension]
    @engine.render = @$.Q.nbind(@engine.render, @$.t[extension])

    @load((str) =>
      @content = str

      if opts.ready?
        opts.ready?()
    )

    path = @path.toLowerCase()

    if opts.base?
      base = @$.p.normalize(opts.base)
      if (index = path.indexOf(base)) isnt -1
        path = path.substr(index + base.length)

    if (sep = path.indexOf(@$.p.sep)) isnt -1 and (sep is 0)
      @name = path.substr(sep + 1)
    else
      @name = path

    @name = @name.replace(/\\/g, '/')

    return

  load: (cb) ->
    @$.fs.readFile(@path, (err, content) =>
      throw new Error(@$.Utils.sprintf('View "%s" doesnt exists', @path)) if err

      cb(content.toString())
    )

  render: (data = {}) ->
    @engine.render(@content, data)
}