module.exports = {
  $singleton: true
  $deps: [
    {'Promise':'bluebird'}
    {'sprintf': 'sprintf-js'}
    {'_':'lodash'}
    {'g':'getobject'}
    {'curry':'better-curry'}
  ]
  $setup: ->
    # import all lodash functions
    @$implement(@$._)
    # sprintf
    @$implement(
      sprintf: @$.sprintf.sprintf
      vsprintf: @$.sprintf.vsprintf
    )
    # Promise
    @$implement(Promise: @$.Promise, false, true)
    # curry
    @$implement(
      Curry: @$.curry
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

  noop: ->

  assignObject: (out, path, value) ->
    if @isArray(path)
      path = path.join('.')

    @$.g.set(out, path, value)
}