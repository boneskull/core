module.exports = {
  $deps: [
    'Schema'
    'Utils'
    'Log'
    {'Q':'q'}
    {'g':'getobject'}
  ]
  $static: {
    models: {}

    factory: (type, name, definition) ->
      model = new @(type, name, definition)
      @$.Utils.assignObject(@models, name.split(/\//g), model)

      model
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

    # monkey patch jugglingdb to use promises
    nproto = [
      'update','create','upsert','updateOrCreate',
      'findOrCreate','exists','find','all','findOne',
      'destroyAll','count'
    ]

    @$.Utils.wrapConditionalPromise(@model, i) for i in nproto

    proto = [
      'save','destroy','updateAttribute',
      'updateAttributes','reload'
    ]

    @$.Utils.wrapConditionalPromise(@model::, i) for i in proto

    for own name,func of @model
      if (typeof func is 'function')
        @[name] = ((func, model) ->
          ->
            func.apply(model, arguments)
        )(func, @model)

    return

}