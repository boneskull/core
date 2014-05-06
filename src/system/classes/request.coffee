module.exports = {
  $deps: [
    'Route'
    'RequestExternal'
    'RequestInternal'
    {'x': 'express'}
  ]
  $static: {
    $setup: ->
      @$implement(@$.x.request)

    factory: (obj = {}) ->
      # much faster than instantiation
      obj['isExternal'] = false if not obj['isExternal']

      if obj.url?.indexOf('://') isnt -1
        obj.isExternal = true

      obj.__proto__ = @

      obj

    process: (routes = null) ->
      routes ?= @$.Route.routes

      for index,route of routes
        # We found something suitable
        if params = route.matches(@)
          return {
            params: params
            route: route
          }

      null

    execute: (routes = null) ->
      if ext = @process(routes)
        @route = ext.route
        @isExternal = ext.route.isExternal()

        if ext.params['directory']?
          @directory = ext.params['directory']
          delete ext.params['directory']

        if ext.params['controller']?
          @controller = ext.params['controller']
          delete ext.params['controller']

        if ext.params['action']?
          @action = ext.params['action']
          delete ext.params['action']
        else
          @action = @$.Route.defaultAction

        @params = ext.params

      if not ext or not (ext.route instanceof @$.Route)
        throw new Error("Route not found: #{@path}")

      if @isExternal
        @$.RequestExternal.execute(@)
      else
        @$.RequestInternal.execute(@)

  }
}