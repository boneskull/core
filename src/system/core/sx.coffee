Factory = require './factory'
app = require('express')()

# Global singleton, the heart of the SX framework

module.exports = (root) ->
  'use strict'

  global.sx = ES5Class.define('sx', {}, ->

    init = =>
      factoryChannel = postal.channel 'Factory'
      sxChannel = postal.channel 'sx'

      @implement(
        # repository
        classes: {}

        modules: {}

        controllers: {}

        routes: {}

        models: {}

        paths:
          'root'   : path.normalize(root + '/')
          'system' : path.normalize(root + '/system/')
          'app'    : path.normalize(root + '/app/')
          'public' : path.normalize(root + '/public/')
          'modules': path.normalize(root + '/modules/')

        load: (name, where) ->
          path = if where? and where of @paths then "#{@paths[where]}#{name}" else ""
          require path

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
        (data) =>
          if data.class?
            if (data.class.$singleton is true) or (data.class.$global is true)
              @[data.name] = data.class
            else if data.class.$initialize?
              @[data.name] = data.class.create(data.class.$initialize)

            @events.publish 'class.created', data
      )

      toPath = (item) =>
        obj = @classes

        if _.isArray(item)
          for x in item
            if obj[x]?
              obj = obj[x]

          obj
        else if _.isString(item)
          if item.indexOf('.') > -1
            toPath(item.split('.'))
        else
          obj

      @implement(
        factory: Factory(@classes, factoryChannel)

        controller: (name) ->
          toPath(name)

        module: (name) ->
          toPath(name)

        model: (name) ->
          toPath(name)

        route: (name) ->
          toPath(name)

        app: app
      )

      loaddir = (spath, ext = '') =>
        _(fs.readdirSync(@paths[spath] + ext)).each((file) =>
          @load(path.normalize(ext + '/' + file), spath)
        )


      # load system classes
      loaddir('system', 'classes')

      # load modules
      #fs.readdirSync()

      # load app classes
      @load('bootstrap', 'app')

      #fs.readdirSync()

      return

    init: init
  )

  sx.init()