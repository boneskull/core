module.exports = {
  $deps: [
    {'jugglingdb': 'promised-jugglingdb'}
  ]
  $static: {
    schemas: {}
    $setup: (sx) ->
      @config = sx.config('database').env()

      @Schema = @$.jugglingdb.Schema

      return

    get: (name) ->
      return @schemas[name] if @schemas[name]?

      throw new Error('No setting for that schema') if not @config.get(name) and name isnt 'memory'

      @schemas[name] = new @Schema(name, @config.get(name))
  }
}