module.exports = {
  $deps: [
    'Utils'
    {'spdy':'spdy'}
    {'http':'http'}
    {'https':'http'}
  ]
  $extend: 'EventEmitter',
  construct: (options = {}) ->
    @$super()

    if (Utils.has(options, 'spdy'))
      @spdy = {
        ca: options.spdy.ca,
        cert: options.spdy.cert,
        key: options.spdy.key,
      }
      @server = @$.spdy.createServer(@spdy)
    else if (Utils.has(options, 'cert') and Utils.has(options, 'key'))
      @https = {
        ca: options.ca,
        cert: options.cert,
        key: options.key,
        passphrase: options.passphrase
      }
      @server = @$.https.createServer(@https)
    else
      @http = {

      }
      @server = @$.http.createServer()

  serverIs: (type = 'http') ->
    switch type.toLowerCase()
      when 'spdy','https','http'
        

}