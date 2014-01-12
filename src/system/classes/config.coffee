module.exports = {
  $deps: [
    {'_': 'lodash'}
    {'g':'getobject'}
  ]
  construct: (@name, data) ->
    @data = if @$._.isPlainObject(data) then data else {}

  clone: ->
    @$._.cloneDeep(@data)

  set: (name, value) ->
    return @ if not name

    if @$._.isArray(name)
      name = name.join('.')

    if name instanceof @$class
      @data = @$._.merge(@data, name.data)
    else if @$._.isString(name)
      @$.g.set(@data, name, value)
    else
      @data = @$._.merge(@data, name)

    @

  wipe: (data = {}) ->
    @data = data

  unset: (name) ->
    if name? and @data[name]?
      delete @data[name]
    @

  get: (name, inexistant = null) ->
    return inexistant if not name

    if @$._.isArray(name)
      name = name.join('.')

    if @$.g.exists(@data, name)
      @$.g.get(@data, name)
    else
      inexistant

  isset: (name) ->
    typeof(@data[name]) isnt 'undefined'

  env: (name) ->
    name ?= process.env.NODE_ENV
    return @ if not @data['*']? or ((not name?) or not (@data[name]?))

    @wipe(@$._.merge(@data['*'], @data[name]))

    @

}
