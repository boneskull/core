slugg = require 'slugg'

sx.factory('Url', {
  $singleton: true

  title: (name, separator = '-') ->
    name = slugg(name)
    if separator isnt '-'
      name.replace(/-/g, separator)

    name

  site: (name) ->

  route: (name) ->
})