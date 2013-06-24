Factory = require path.normalize(__dirname + '/factory')

module.exports = (root) ->
  
  global.sx = sx = Class.define('sx', {}, ->
    
    init = ->
      factoryChannel = postal.channel 'Factory'
      sxChannel = postal.channel 'sx'

      sx.implement(
        classes: {}
        
        modules: {}
        
        controllers: {}
        
        models: {}
        
        paths:
          'system' : path.normalize(root + '/system/')
          'app'    : path.normalize(root + '/app/')
          'public' : path.normalize(root + '/public/')
          'modules': path.normalize(root + '/modules/')
        
        events: 
          create: postal
          
          channel: (name) ->
            postal.channel name
            
          publish: (event, data) ->
            sxChannel.publish event, data
            
          subscribe: (event, cb) ->
            sxChannel.subscribe event, cb
              
          unsubscribe: (event) ->
            subscribers = postal.utils.getSubscribersFor {channel: 'sx', topic: event}
            
            if subscribers?.length
              subscriber.unsubscribe() for subscriber in subscribers
      )
      
      factoryChannel.subscribe(
        'class.created'
        (data, envelope) ->
          if data.class?
            if data.class.$singleton is true
              sx[data.name] = data.class
              
            sx.events.publish 'class.created', data
      )
      
      sx.implement factory: Factory(sx.classes, factoryChannel)
      
      return
    
    {
      init: init  
    }
  )
  
  sx.init()

  