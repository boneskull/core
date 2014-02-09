module.exports = {
  $singleton: true
  $deps: [
    {'lusca':'lusca'},
    {'cors':'cors'}
  ]
  $setup: (sx) ->
    config = sx.config('security').env()

    if config.get('csrf') is true
      sx.app.use(@$.cors())

    if (csp = config.get('csp')) and (csp.enabled is true)
      config.
      sx.app.use(@$.lusca.csp(config.get('csp')))
}