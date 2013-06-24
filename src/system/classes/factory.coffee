# add the created classes in repository
# publishes to channel the topic 'class.created'

module.exports = (repository, channel) ->
  
  apply = (name, declaration, createdClass) ->
    extend = []
    
    existing = createdClass?
    
    createdClass ?= Class.define(name)
    
    if _.isFunction(declaration)
      declaration = declaration.call(createdClass, createdClass.$parent)
    
    if existing and createdClass.$singleton
      declaration.$singleton = true
    
    if declaration.$extend?
      
      declaration.$extend = [declaration.$extend] if not _.isArray(declaration.$extend)
      
      for clss in declaration.$extend
        if _.isString clss
          if clss of repository
            extend.push repository[clss]
            declaration.$singleton = true if repository[clss].$singleton?
        else if clss.$className
          extend.push clss
          declaration.$singleton = true if clss.$singleton
          
      delete declaration.$extend
    
    createdClass.implement extend
    
    if declaration.$static
      createdClass.implement(declaration.$static)
      delete declaration.$static
    
    if declaration.$singleton is true
      createdClass.implement(declaration)
    else
      createdClass.include(declaration)
  
    repository[name] = createdClass
    
    channel.publish 'class.created', {class: repository[name], name: name }
      
    createdClass
  
  create = (name, declaration = {}) ->
    apply(name, declaration)

  extend = (name, declaration = {}) ->
    apply(name, declaration, repository[name])
    
  (name, declaration = {}) ->
    name = _s.classify(name)
    
    if arguments.length is 1
      # No parent has been passed, only a 'name' as string
      if !(name of repository)
        out = create(name)
      else
        out = repository[name]
    else
      if (name of repository)
        out = extend(name, declaration)
      else
        out = create(name, declaration)

    out
 