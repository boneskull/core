module.exports = {
  $deps: [
    {'_': 'lodash'}
    {'g':'getobject'}
  ]
  construct: (@name, data) ->
    @envmode = false
    @data = if @$._.isPlainObject(data) then data else {}
    return

  clone: (part = false) ->
    if part is false
      @$._.cloneDeep(@data)
    else if data = @get(part)
      @$._.cloneDeep(data)

  set: (name, value) ->
    return @ if not name

    name = @_convert(name)

    if name instanceof @$class
      @data = @$._.merge(@data, name.data)
    else if @$._.isString(name)
      @$.g.set(@data, name, value)
    else
      @data = @$._.merge(@data, name)

    @

  wipe: (data = {}) ->
    @data = data

  _getParts: (str) ->
    str.replace(/\\\./g, '\uffff').split('.').map((s) ->
      s.replace(/\uffff/g, '.')
    )

  _convert: (name) ->
    if @$._.isArray(name)
      name = name.join('.')

    name

  unset: (name) ->
    if name = @_convert(name)
      if @isset(name)
        obj = @data
        parts = @_getParts(name)
        if parts.length is 1
          delete @data[name]
        else
          while (typeof obj == 'object' and parts.length)
            part = parts.shift()

            if parts.length is 0
              delete obj[part]
              break
            else
              obj = obj[part]

    @

  get: (name, inexistant = null) ->
    return inexistant if not name

    name = @_convert(name)

    if @isset(name)
      @$.g.get(@data, name)
    else
      inexistant

  isset: (name) ->
    name = @_convert(name)

    @$.g.exists(@data, name)

  env: (name) ->
    name ?= process.env.NODE_ENV or 'development'

    return @ if not @data['*']? or ((not name?) or not (@data[name]?))

    @envmode = name

    @wipe(@$._.merge(@data['*'], @data[name]))

    @

}
