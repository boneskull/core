module.exports = {
  $singleton: true
  $deps: [
    {'Q':'q'}
    {'sprintf': 'sprintf-js'}
    {'_':'lodash'}
    {'g':'getobject'}
  ]
  $setup: ->
    # import all lodash functions
    @$implement(@$._)
    # sprintf
    @$implement(
      sprintf: @$.sprintf.sprintf
      vsprintf: @$.sprintf.vsprintf
    )

  strReplace: (search, replace, subject) ->
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

    for i,v of s
      continue if not s[i]
      for j,v of f
        temp = s[i] + ''
        repl = (if ra then ((if r[j] isnt `undefined` then r[j] else "")) else r[0])
        s[i] = temp.split(f[j]).join(repl)

    if sa then s else s[0]

  promesifyAll: (source, dest, only = []) ->
    hasOnly = only.length > 0

    for k,v of source
      continue if (hasOnly) and (only.indexOf(k) is -1)
      continue unless @$._.isFunction(v)

      dest[k] = @$.Q.nbind(v, source)

    return

  wrapConditionalPromise: (context, funcName, isReturn = false, baseContext = null) ->
    return if typeof context[funcName] isnt 'function'

    original = context[funcName]

    defined = original.length # number of arguments, last one is usually the callback
    Q = @$.Q

    if isReturn is true
      context[funcName] = ->
        d = Q.defer()

        try
          d.resolve(original.apply(context, arguments))
        catch e
          d.reject(e)

        d.promise

      return

    # eg: if theres 3 args, and the callback is passed, don't return a promise, but execute the callback
    context[funcName] = ->
      args = Array.prototype.slice.call(arguments)

      if args.length is defined
        # callback is included, act like the original call
        original.apply(baseContext || context, args)
      else
        # return the promise this time
        d = Q.defer()
        args.push(d.makeNodeResolver())

        try
          original.apply(baseContext || context, args)
        catch e
          d.reject(e)

        d.promise

  noop: ->

  assignObject: (out, path, value) ->
    if @isArray(path)
      path = path.join('.')

    @$.g.set(out, path, value)
}