Factory = require './factory'

app = require('express')()

path = require('path')
fs = require('fs')
glob = require('glob')
_ = require('lodash')
_s = require('underscore.string')
postal = require('postal')(_)
ES5Class = require('es5class')

# Global singleton, the heart of the SX framework

module.exports = ES5Class.define('sx', {}, ->

    sxChannel = postal.channel 'sx'

    init = =>
      loaddir = (spath, ext = '') =>
        _(fs.readdirSync(@paths[spath] + ext)).each((file) =>
          @load(path.normalize(ext + '/' + file), spath)
        )



      # load app classes
      #@load('bootstrap')

    setPaths = (root) =>

      normalize = (_path) ->
        path.normalize(root + _path)

      @implement(
        paths:
          root   : normalize('/')
          system : normalize('/system/')
          app    : normalize('/app/')
          public : normalize('/public/')
          modules: normalize('/modules/')
      )

      return

    classes = {}
    configs = {}

    dependencyLoader = (data) =>
      if data.class?
        if data.class.$singleton is true
          @[data.name] = data.class

        if _.size(data.class.$deps)
          dependencies = {}

          for key,dep of data.class.$deps
            if _.isString(dep)
              if classes[dep]
                dependencies[dep] = classes[dep]
              else
                if loaded = @load(dep)
                  dependencies[dep] = loaded
                else
                  throw new Error(_s.sprintf('Invalid dependency on %s: %s', data.name, dep))
            else if _.isPlainObject(dep)
              for key,i of dep
                if _.isArray(i)
                  dependencies[key] = require(i[0])[i[1]]
                else
                  dependencies[key] = require(i)
            else
              throw new Error(_s.sprintf('$deps for %s must be an array of strings or objects', data.name))

          data.class.implement($: dependencies).include($: dependencies)

        data.class.$setup?(@)

        if data.class.$initialize? and not data.class.$singleton?
          @[data.name] = new data.class(data.class.$initialize)

    {
      # repository
      classes: classes
      modules: {}
      controllers: {}
      routes: {}
      models: {}
      configs: configs
      _toPath: (item, type = 'classes') ->
        obj = @[type]

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

      controller: (name) ->
        @_toPath(name)

      module: (name) ->
        @_toPath(name)

      model: (name) ->
        @_toPath(name)

      route: (name) ->
        @_toPath(name)

      config: (name) ->
        @_toPath(name)

      app: app
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

      factory: Factory(classes, dependencyLoader)
      setPaths: setPaths
      init: init
      loadConfig: (name, where) ->

        if where is undefined
          ret = false
          # unespecific, load in cascade
          for v in ['system','modules','app']
            if (_ret = @loadConfig(name, v)) isnt false
              ret = _ret

          return ret
        else
          if where is 'modules'
          else
            _path = if where of @paths then path.normalize("#{@paths[where]}config/#{name.toLowerCase()}.js") else false

        if _path and fs.existsSync(_path)
          declaration = require _path
          name = _s.classify(name)

          if _.isFunction(declaration)
            declaration = declaration(@)

          if not configs[name]?
            configs[name] = classes.Config(name, declaration)
          else
            configs[name].set(declaration)

          return configs[name]

        false


      load: (name, where) ->
        _path = false

        if where is undefined
          ret = false
          # unespecific, load in cascade
          for v in ['system','modules','app']
            if (_ret = @load(name, v)) isnt false
              ret = _ret

          return ret
        else
          if where is 'modules'
          else
            _path = if where of @paths then path.normalize("#{@paths[where]}classes/#{name.toLowerCase()}.js") else false

        if _path and fs.existsSync(_path)
          declaration = require _path
          cls = @factory(name, declaration)
          return cls

        false
    }
)