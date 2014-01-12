module.exports = {
  $deps: [
    'Utils'
    {'_s':'underscore.string'}
  ]
  $static: {
    $setup: (sx) ->
      controllerName = @$className
      if controllerName isnt 'Controller'
        sx.controllers[controllerName] = new @

      return
  }
  error: (path) ->
    throw new Error(@$.Utils.sprintf('The requested URL %s was not found on this server.', path))

  after: (req, res) ->
    # nothing by default

  before: (req, res) ->
    # nothing by default

  execute: (req, res) ->
    @before(req, res)

    if req?.params?.action?
      action = "action#{@$._s.capitalize(req.params.action)}"
      if @[action]?
        @[action](req, res)
      else
        @error(req.path)
    else
      @error(req.path)

    @after(req, res)

    return

}