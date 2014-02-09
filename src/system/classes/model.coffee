module.exports = {
  $deps: [
    'Schema'
    'Utils'
    'Log'
    {'Q':'q'}
  ]
  $static: {
    models: {}
    factory: (type, name, definition) ->
      @models[name] = new @(type, name, definition)
  }
  getSchema: (type = 'memory') ->
    @$.Schema.get(type)

  _applyRelation: (type, name) ->
    if @$relations[type]?
      isArray = false

      modelName = if @$.Utils.isArray(@$relations[type])
               isArray = true
               @$relations[type][0]
             else
               @$relations[type]

      if modelName.$class?
        modelName = modelName.$class.$className

      if @db.models[modelName]?
        args = [@db.models[modelName]].concat((if isArray then @$relations[type] else [@$relations[type]]).slice(1))
        @model[type].apply(@model, args)
      else
        throw new Error(@$.Utils.sprintf('Model "%s" doesnt exists in "%s" of model "%s"', modelName, type, name))

    return

  construct: (type, name, definition) ->
    name ?= @$class.$className

    if @$db
      type = @$db

    if @$attrs?
      definition = @$attrs

    @db = @getSchema(type)

    @Schema = @$.Schema.Schema

    if not definition
      definition ?= {}

    if @$.Utils.isFunction(definition)
      d = @$.Q.defer()
      definition = definition.call(@, d.resolve)

    @model = @db.define(name, definition)

    if @$functions?
      @model::[k] = v for k,v of @$functions

    if @$relations?
      @_applyRelation('belongsTo', name)
      @_applyRelation('hasMany', name)
      @_applyRelation('hasAndBelongsToMany', name)

    if d?
      d.promise.done((cb) =>
        cb.call(@, @model)
        d = null

        return
      )

      if d.promise.inspect() isnt 'fulfilled'
        d = null

    @$.Utils.promesifyAll(@model, @)

    return

  createNew: (data) ->

    model = {
      model: new @model(data, @db)
    }

    for k,v of @model.properties when k isnt 'model'
      Object.defineProperty(model, k, {
        get: ((v)->
          ->
            @model[v]
        )(k)
        set: ((v) ->
          (value) ->
            @model[v] = value
            return
        )(k)
        enumerable: true
      })

    @$.Utils.promesifyAll(model.model, model)

    model
}