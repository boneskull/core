module.exports = {
  $deps: [
    'Schema'
    'Utils'
    'Log'
    {'Q':'q'}
  ]
  $static: {
    $setup: (sx) ->
      modelName = @$className
      if modelName isnt 'Model'
        sx.models[modelName] = new @

      return

    factory: (type, name, definition) ->
      new @(type, name, definition)
  }
  getSchema: (type = 'memory') ->
    @$.Schema.get(type)

  _applyRelation: (type) ->
    if @$relations[type]?
      isArray = false

      modelName = if @$.Utils.isArray(@$relations[type])
               isArray = true
               @$relations[type][0]
             else
               @$relations[type]

      if @db.models[modelName]?
        @model[type].apply(@model, if isArray then  @$relations[type] else [@$relations[type]])
      else
        throw new Error(@$.Utils.sprintf('Model "%s" doesnt exists in "%s" of model "%s"', modelName, type, @model.name))

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
      @_applyRelation('belongsTo')
      @_applyRelation('hasMany')
      @_applyRelation('hasAndBelongsToMany')

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
        get: ((k)->
          ->
            @model[k]
        )(k)
        set: ((k) ->
          (value) ->
            @model[k] = value
            return
        )(k)
        enumerable: true
      })

    @$.Utils.promesifyAll(model.model, model)

    model
}