module.exports = {
  $deps: [
    {'_': 'lodash'}
  ]
  construct: (@name, data) ->
    @data = if @$._.isPlainObject(data) then data else {}

  clone: ->
    @$._.cloneDeep(@data)

  set: (name, value) ->
    if name instanceof @$class
      @data = @$._.merge(@data, name.data)
    else if @$._.isString(name)
      @data[name] = value
    else
      @data = @$._.merge(@data, name)

    @

  wipe: (data = {}) ->
    @data = data

  unset: (name) ->
    if @data[name]?
      delete @data[name]
    @

  get: (name, inexistant = null) ->
    if @data[name]?
      @data[name]
    else
      inexistant

  isset: (name) ->
    typeof(@data[name]) isnt 'undefined'

  env: (name) ->
    return @ if not @data['*']? and not @data[name]?
    @wipe(@$._.defaults(@data[name], if @data['*']? then @data['*'] else {}))
    @

}
