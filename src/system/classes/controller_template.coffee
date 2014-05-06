module.exports = {
  $deps: [
    'View'
  ]
  $extend: 'Controller'
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