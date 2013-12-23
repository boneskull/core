# add the created classes in repository
# publishes to channel the topic 'class.created'

ES5Class = require('es5class')
_s = require('underscore.string')
_ = require('lodash')

module.exports = (repository, callback) ->
  'use strict'

  apply = (name, declaration, createdClass) ->
    extend = []

    existing = createdClass?

    if declaration.$extend?
      if repository[declaration.$extend]?
        createdClass = repository[declaration.$extend].define(name)
      else if declaration.$extend.$class?
        createdClass = declaration.$extend.define(name)
      else
        createdClass ?= ES5Class.define(name)
    else
      createdClass ?= ES5Class.define(name)

    if _.isFunction(declaration)
      declaration = declaration.call(createdClass, createdClass.$parent)

    if existing and createdClass.$singleton
      declaration.$singleton = true

    if declaration.$implement?

      declaration.$implement = [declaration.$implement] if not _.isArray(declaration.$implement)

      for clss in declaration.$implement
        if _.isString clss
          if clss of repository
            extend.push repository[clss]
            declaration.$singleton = true if repository[clss].$singleton?
        else if clss.$className
          extend.push clss
          declaration.$singleton = true if clss.$singleton

      delete declaration.$implement

    createdClass.implement extend

    if declaration.$static
      # always go to base function instead of prototype
      createdClass.implement(declaration.$static)
      delete declaration.$static

    if declaration.$deps
      # convert any abnormal dependency name to a proper CamelCase
      for k,v of declaration.$deps
        if _.isString(declaration.$deps[k])
          declaration.$deps[k] = classify(v)

      # pass in the dependencies array to the class, to be converted to an object later on
      # available in both class and prototype
      createdClass.implement({
                               $deps: declaration.$deps,
                               $: {}
                               prototype: {$deps: declaration.$deps, $: {}}
                             })
      delete declaration.$deps

    if declaration.$singleton is true
      # everything goes to the base function
      createdClass.implement declaration
    else
      # everything goes to the prototype
      createdClass.include declaration

    # modify our repository to have our new(?) class
    repository[name] = createdClass

    callback?(class: repository[name], name: name)

    createdClass

  (name, declaration = {}) ->
    name = classify(name)

    create = () ->
      apply(name, declaration, null)

    extend = () ->
      apply(name, declaration, repository[name])

    if arguments.length is 1
      # No parent has been passed, only a 'name' as string
      out = if not (name of repository) then create() else repository[name]
    else
      out = if (name of repository) then extend() else create()

    out

module.exports.classify = classify = (name) ->
  _s.classify(name.replace(/\-/g, ' '))