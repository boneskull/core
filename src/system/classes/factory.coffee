# add the created classes in repository
# publishes to channel the topic 'class.created'

module.exports = (repository, channel) ->
  
  apply = (name, declaration, createdClass) ->
    inherits = []
    
    existing = createdClass?
    
    if existing and createdClass.$singleton
      declaration.$singleton = true
    
    if declaration.$inherits?
      
      declaration.$inherits = [declaration.$inherits] if not _.isArray(declaration.$inherits)
      
      for clss in declaration.$inherits
        if _.isString clss
          if clss of repository
            inherits.push repository[clss]
            declaration.$singleton = true if repository[clss].$singleton?
        else if clss.$className
          inherits.push clss
          declaration.$singleton = true if clss.$singleton
          
      delete declaration.$inherits
    
    createdClass ?= Class.extend(name)
    
    createdClass.implement inherits
    
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
 