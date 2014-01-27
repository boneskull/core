module.exports = {
  $deps: [
    {'jugglingdb': 'jugglingdb'}
  ]
  $static: {
    $setup: (sx) ->
      @config = sx.config('database').env(process.env.NODE_ENV || 'development')

      @Schema = @$.jugglingdb.Schema

      return

    get: (name) ->
      return @schemas[name] if @schemas[name]?

      throw new Error('No setting for that schema') if not @config.get(name) and name isnt 'memory'

      @schemas[name] = new @Schema(name, @config.get(name))

    schemas: {}
  }
}