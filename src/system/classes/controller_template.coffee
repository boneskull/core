module.exports = {
  $deps: [
    'View'
  ]
  $extend: 'Controller'
  $static: {
    $setup: (sx) ->
      @$super(sx) unless @$className is 'ControllerTemplate'
      return
  }
  before: (req, res) ->
    @$super(req, res)

    if @autoRender
      @template = @$.View.factory()

    return

  after: (req, res) ->
    @$super(req, res)

    return

  autoRender: true
  template: 'template'
}