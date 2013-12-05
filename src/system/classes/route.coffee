str_replace = (search, replace, subject, count) ->
  ###
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Gabriel Paderni
  // +   improved by: Philip Peterson
  // +   improved by: Simon Willison (http://simonwillison.net)
  // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   bugfixed by: Anton Ongson
  // +      input by: Onno Marsman
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    tweaked by: Onno Marsman
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   input by: Oleg Eremeev
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Oleg Eremeev
  // %          note 1: The count parameter must be passed as a string in order
  // %          note 1:  to find a global variable in which the result will be given
  // *     example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
  // *     returns 1: 'Kevin.van.Zonneveld'
  // *     example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
  // *     returns 2: 'hemmo, mars'
  ###
  j = 0
  temp = ''
  repl = ''
  f = [].concat(search)
  r = [].concat(replace)
  s = subject
  ra = Object::toString.call(r) is '[object Array]'
  sa = Object::toString.call(s) is '[object Array]'
  s = [].concat(s)

  @window[count] = 0 if count

  for i,v of s
    continue if not s[i]
    for j,v of f
      temp = s[i] + ''
      repl = (if ra then ((if r[j] isnt `undefined` then r[j] else "")) else r[0])
      s[i] = temp.split(f[j]).join(repl)

      @window[count] += (temp.length - s[i].length) / f[j].length if count and s[i] isnt temp

  if sa then s else s[0]

module.exports = {
  $deps: [
    'Url',
    {'_s': 'underscore.string'},
    {'_' : 'lodash'},
    {'XRegExp': ['xregexp','XRegExp']}
  ]
  $static   : {
    REGEX_GROUP    : '<([a-zA-Z0-9_]+)>|(?:\\([^()]+\\))+?|(?:\\([^()]+\\)*)+'
    REGEX_SUB      : '\\(([a-zA-Z0-9_/<>()\\-]+)\\)'
    REGEX_SEGMENT  : '[^/.,;?\\n]+'
    REGEX_ESCAPE   : '[#.+*?[^\\]${}=!|]'
    defaultProtocol: 'http://'
    defaultAction  : 'index'
    localhosts     : [false, '', 'local', 'localhost']
    routes         : {}
    setup: ->
      if @$._.isString(@REGEX_GROUP)
        # don't initialize it everytime, cache the XRegExp compilation
        @REGEX_GROUP = @$.XRegExp(@REGEX_GROUP)

      if @$._.isString(@REGEX_SUB)
        # don't initialize it everytime, cache the XRegExp compilation
        @REGEX_SUB = @$.XRegExp(@REGEX_SUB)

    set            : (name, uri, regex) ->
      @routes[name] = new @(uri, regex)

    get: (name) ->
      if not @routes[name]
        throw new Error("The requested route does not exist: #{name}")

      @routes[name]

    find: (route) ->
      if route and route.$instanceOf and not route.$instanceOf(@)
        throw new Error("You must pass in a router to the name function")

      for k,v of @routes
        return k if v is route

      false

    url: (name, params = {}, protocol) ->
      route = @get(name)

      if route.isExternal()
        route.uri(params)
      else if @$.Url
        @$.Url.site(route.uri(params), protocol)
      else
        throw new Error("Url class dependency not loaded")

    compile: (uri, regex = {}) ->
      expression = @$.XRegExp.replace(uri, @REGEX_ESCAPE, '\\\\$0', 'all')

      if expression.indexOf('(') isnt -1
        expression = str_replace(['(',')'], ['(',')?'], expression)

      expression = str_replace(['<','>'], ['(?<','>' + @REGEX_SEGMENT + ')'], expression)

      if @$._.size(regex)

        search = []
        replace = []

        for key,value of regex
          search.push("<#{key}>#{@REGEX_SEGMENT}")
          replace.push("<#{key}>#{value}")

        expression = str_replace(search, replace, expression)

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
    if not @$._.isFunction(callback)
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

    if not @$._.isEmpty(params['controller'])
      params['controller'] = params['controller'].toLowerCase()

    if not @$._.isEmpty(params['directory'])
      params['directory'] = params['directory'].toLowerCase()

    if @_filters
      for callback in @_filters
        # Execute the filter giving it the route, params, and request
        _return = callback.call(@, params, request)

        if _return is false
          # Filter has aborted the match
          return false
        else if @$._.isArray(_return)
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

    compile = (portion, required) =>
      missing = []

      result = @$.XRegExp.replace(portion, pattern, (match, param) =>
        if match.charAt(0) is '<'
          # Parameter, unwrapped

          if params[param] isnt undefined
            # This portion is required when a specified
            # parameter does not match the default
            required = (required or @$._.isEmpty(defaults[param]) or params[param] isnt defaults[param])

            # Add specified parameter to this result
            return params[param]

          # Add default parameter to this result
          if defaults[param] isnt undefined
            return defaults[param]

          # This portion is missing a parameter
          missing.push param
        else
          # Group, unwrapped
          match = sub.exec(match)

          if match and match[1]
            _result = compile(match[1], false)

            if _result[1]
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

    return uri.replace(/[\(\)]/g, '')

  _filters: []
  _uri: ''
  regex: []
  _defaults: {'action': 'index', host: false}
  routeRegex: ''
}