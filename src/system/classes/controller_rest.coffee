module.exports = {
  $extend: 'Controller'
  $static: {
    $setup: (sx) ->
      @$super(sx) unless @$className is 'ControllerRest'
      return
  }
  find: (req, res) ->
  insert: (req, res) ->
  update: (req, res) ->
  destroy: (req, res) ->
}