module.exports = {
  $deps: [
    'Url'
    'Utils'
    {'_s': 'underscore.string'}
    {'XRegExp': ['xregexp','XRegExp']}
  ]
  $static   : {
    REGEX_GROUP    : '<([^>]+)>|(?:\\([^(]+\\))+?|(?:\\([^]+\\))+'
    REGEX_SUB      : '\\(([a-zA-Z0-9_\\/<>\\(\\)\\-\\.]+)\\)'
    REGEX_SEGMENT  : '[^\\/\\.,;\\?\\n]+'
    REGEX_ESCAPE   : '[\\/\\#\\.\\+\\*\\?\\[\\^\\]\\$\\{\\}\\=\\!\\|]+'
    defaultProtocol: 'http://'
    defaultAction  : 'index'
    localhosts     : [false, '', 'local', 'localhost']
    routes         : {}
    $setup: ->
      if @$.Utils.isString(@REGEX_GROUP)
        # don't initialize it everytime, cache the XRegExp compilation
        @REGEX_GROUP = @$.XRegExp(@REGEX_GROUP, 'g')

      if @$.Utils.isString(@REGEX_SUB)
        # don't initialize it everytime, cache the XRegExp compilation
        @REGEX_SUB = @$.XRegExp(@REGEX_SUB)

      if @$.Utils.isString(@REGEX_ESCAPE)
        # don't initialize it everytime, cache the XRegExp compilation
        @REGEX_ESCAPE = @$.XRegExp(@REGEX_ESCAPE, 'g')

    set            : (name, uri, regex) ->
      @routes[name] = new @(uri, regex)

    get: (name) ->
      if not @routes[name]
        throw new Error("The requested route does not exist: #{name}")

      @routes[name]

    find: (route) ->
      if route and (not route instanceof @)
        throw new Error("You must pass in a router to the name function")

      for k,v of @routes
        return k if v is route

      false

    url: (name, params = {}, protocol = false, request = null) ->
      route = @get(name)

      if route.isExternal()
        route.uri(params)
      else if @$.Url
        @$.Url.site(route.uri(params), protocol, request)

    compile: (uri, regex = {}) ->
      expression = @$.XRegExp.replace(uri, @REGEX_ESCAPE, '\\$&', 'all')

      if expression.indexOf('(') isnt -1
        expression = @$.Utils.strReplace(['(',')'], ['(',')?'], expression)

      expression = @$.Utils.strReplace(['<','>'], ['(?<','>' + @REGEX_SEGMENT + ')'], expression)

      if @$.Utils.size(regex)

        search = []
        replace = []

        for key,value of regex
          search.push("<#{key}>#{@REGEX_SEGMENT}")
          replace.push("<#{key}>#{value}")

        expression = @$.Utils.strReplace(search, replace, expression)

      @$.XRegExp('^' + expression + '$', 'nx')
  },
  construct: (uri, regex) ->
    return if not uri

    @_uri = uri

    @regex = regex if regex

    @routeRegex = @$class.compile(uri, regex)

  defaults: (defaults) ->
    if defaults is null
      return @_defaults

    @_defaults = defaults

    @

	filter: (callback) ->
    if not @$.Utils.isFunction(callback)
      throw new Error('Invalid Route.filter specified, it must be a function')

    @_filters = [].concat(@_filters, callback)

    @

  matches: (request) ->
		# Get the URI from the Request

    uri = @$._s.rtrim((if request and request.path? then request.path else "#{request}"), '/')
    matches = @$.XRegExp.exec(uri, @routeRegex)

    if matches is null
      return false

    params = {}

    for own key,value of matches
      continue if +key or key is '0' or value is undefined or key in ['index','input']

      # Set the value for all matched keys
      params[key] = value

    for own key,value of @_defaults
      if params[key] is undefined or params[key] is ''
        # Set default values for any key that was not matched
        params[key] = value

    if not @$.Utils.isEmpty(params['controller'])
      params['controller'] = params['controller'].toLowerCase()

    if not @$.Utils.isEmpty(params['directory'])
      params['directory'] = params['directory'].toLowerCase()

    if @_filters
      for callback in @_filters
        # Execute the filter giving it the route, params, and request
        _return = callback.call(@, params, request)

        if _return is false
          # Filter has aborted the match
          return false
        else if @$.Utils.isArray(_return)
          # Filter has modified the parameters
          params = _return

    params

  isExternal: ->
    host = @_defaults.host or false
    @$class.localhosts.indexOf(host) is -1

  uri: (params = {}) ->
    defaults = @_defaults

    pattern = @$class.REGEX_GROUP
    sub = @$class.REGEX_SUB

    pairs = (str) ->
      return true if str.indexOf('(') is -1 and str.indexOf(')') is -1
      str.split(')').length is str.split('(').length and str.indexOf('(') < str.indexOf(')')

    compile = (portion, required) =>
      missing = []

      result = @$.XRegExp.replace(portion, pattern, (match, param) =>
        if match.charAt(0) is '<'
          # Parameter, unwrapped

          if params[param] isnt undefined
            # This portion is required when a specified
            # parameter does not match the default
            required = (required or @$.Utils.isEmpty(defaults[param]) or params[param] isnt defaults[param])

            # Add specified parameter to this result
            return params[param]

          # Add default parameter to this result
          if defaults[param] isnt undefined
            return defaults[param]

          # This portion is missing a parameter
          missing.push param
        else
          # Group, unwrapped
          _match = sub.exec(match)

          if _match?[1]
            if not pairs(_match[1])
              _match = sub.exec(portion)
              if _match?[1]
                _result = compile(_match[1], false)
            else
              _result = compile(_match[1], false)

            if _result?[1] is true
              # This portion is required when it contains a group
              # that is required
              required = true

              # Add required groups to this result
              return _result[0]

              # Do not add optional groups to this result

        return ''
      , 'all')

      if required and missing.length
        throw new Error("Required route parameter is missing: #{missing}")

      return [result, required]

    [uri] = compile(@_uri, true)

    # Trim all extra slashes from the URI
    uri = @$.XRegExp.replace(@$._s.rtrim(uri, '/'), @$.XRegExp('/+'), '/', 'all')

    if @isExternal()
      # Need to add the host to the URI
      host = @_defaults.host

      if host and host.indexOf('://') is -1
        # Use the default defined protocol
        host = @$class.defaultProtocol + host

      # Clean up the host and prepend it to the URI
      uri = @$._s.rtrim(host, '/') + '/' + uri

    return uri

  _filters: []
  _uri: ''
  regex: []
  _defaults: {'action': 'index', host: false}
  routeRegex: ''
}