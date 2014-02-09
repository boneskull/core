module.exports = {
  $deps: [
    'Utils'
    {'spdy':'spdy'}
    {'http':'http'}
    {'https':'http'}
    {'restify':'restify'}
    {'express':'express'}
    {'tls':'tls'}
    {'jsonrpc2':'json-rpc2'}
  ]
  $static: {
    servers: {}
    factory: (name, type, options) ->
      @servers[name] = new @(type, options)
  }
  $extend: 'EventEmitter',
  construct: (@type = 'http', @options = {}) ->
    @$super()

    switch type.toLowerCase()
      when 'spdy'
        @options = {
          ca: options.ca,
          cert: options.cert,
          key: options.key,
        }

        @server = @$.spdy.createServer(@options)
      when 'restify'
        @options = options

        @server = @$.restify.createServer(@options)
      when 'https'
        @options = {
          ca: options.ca,
          cert: options.cert,
          key: options.key,
          passphrase: options.passphrase
        }

        @server = @$.https.createServer(@options)
      when 'tls'
        @options = {

        }

        @server = @$.tls.createServer(@options)
      when 'jsonrpc'
        @options = {

        }

        @server = @$.jsonrpc2.Server.create(@options)
      when 'express'
        @options = options

        @server = @$.express()
      when 'http'
        @options = {}

        @server = @$.http.createServer()
      else
        throw new Error(@$.Utils.sprintf('Invalid server type: "%s"', type))

    return

}