Factory = require('./factory')

app = require('express')()

path = require('path')
fs = require('fs')
glob = require('glob')
_ = require('lodash')
_s = require('underscore.string')
ES5Class = require('es5class')
getobject = require('getobject')

# Global singleton, the heart of the SX framework

module.exports = ES5Class.$define('sx', {}, ->

    classes = {}
    configs = {}

    dependencyLoader = (data, extend = false) =>
      if extend isnt false
        data ?= {}

        if classes[extend]
          data.class = classes[extend]
        else if loaded = @load(extend)
          data.class = loaded

        data.name = data.class.$className

      if data?.class?
        if data.class.$singleton is true
          @[data.name] = data.class

        if _.size(data.class.$deps)
          dependencies = {}

          for key,dep of data.class.$deps
            if _.isString(dep) or _.isArray(dep)
              _dep = if _.isArray(dep) then dep[dep.length - 1] else dep

              if classes[_dep]
                dependencies[_dep] = classes[_dep]
              else
                if loaded = @load(dep)
                  dependencies[_dep] = loaded
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

          if data.class.$parent?.$?
            # Merge the extended class deps
            for k,v of data.class.$parent.$ when not dependencies[k]?
              dependencies[k] = v

          data.class.$implement($: dependencies).$include($: dependencies)

        data.class.$setup?(@)

        return data.class

      null

    {
      # repository
      classes: classes
      modules: {}
      controllers: {}
      models: {}
      configs: configs
      _toPath: (item, type) ->
        switch type
          when 'module','model','controller','config'
            obj = @["#{type}s"]
          else
            throw new Error(_s.sprintf('Invalid _toPath type: %s', type))

        if _.isArray(item)
          item[k] = _s.classify(v) for k,v of item
          item = item.join('.')
        else
          item = _s.classify(item)

        cls = getobject.get(obj, item)

        if not cls?
          if type is 'config'
            @loadConfig("#{item}")
          else
            item = Array.prototype.concat.apply(type, item.split('.'))
            @load(item)
        else
          cls

      controller: (name) ->
        @_toPath(name, 'controller')

      module: (name) ->
        @_toPath(name, 'module')

      model: (name) ->
        @_toPath(name, 'model')

      config: (name) ->
        @_toPath(name, 'config')

      app: app
      factory: Factory(classes, dependencyLoader, @)
      _require: require
      loadConfig: (name, where) ->

        if not classes['Config']?
          @load('Config')

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
          declaration = @_require _path
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

        return false if not name

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
            if _.isArray(name)
              name = name.join('/')

            tmpName = false

            if name.indexOf('_') is -1
              name = name.replace(/[A-Z]/g, (match, index) ->
                return match if index is 0
                return match if name.charAt(index - 1) is '/'
                return "_#{match}"
              )

              if name.indexOf('/') isnt -1
                tmpName = name.split(/\//).pop()

            else
              tmpName = Factory.classify(name)

            _path = if where of @paths then path.normalize("#{@paths[where]}classes/#{name.toLowerCase()}.js") else false

        if _path and fs.existsSync(_path)
          declaration = @_require _path
          if declaration isnt undefined
            cls = @factory(tmpName or name, declaration)
            return cls

        false
    }
)