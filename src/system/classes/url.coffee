module.exports = {
  $singleton: true
  $deps: [
    {'URI': 'URIjs'}
    {'slugg': 'slugg'}
    {'_': 'lodash'}
    {'_s': 'underscore.string'}
  ]

  $setup: (sx) ->
    @config = sx.config('bootstrap').env()

  title: (name, separator = '-') ->
    name = @$.slugg(name)

    if separator isnt '-'
      name.replace(/-/g, separator)

    name

  base: (protocol = null, index = false, request) ->
    # Start with the configured base URL
    baseUrl = @config.get('baseUrl')
    port = @config.get('port')

    if protocol is true
      # Use the config to get the protocol
      protocol = @config.get('protocol')

    if request?.secure?
      if not request.secure
        # Use the current protocol
        [protocol] = request.protocol.toLowerCase()
      else
        protocol = 'https'

    if not protocol
      # Use the configured default protocol
      protocol = @$.URI(baseUrl).protocol() || ''

    if index is true and @config.get('indexFile')
      #Add the index file to the URL
      baseUrl += "#{@config.get('indexFile')}/"

    if not @$._.isEmpty(protocol)

      if port = @$.URI(baseUrl).port()
        #Found a port, make it usable for the URL
        port = ":#{port}"

      if domain = @$.URI(baseUrl).host()
        #Remove everything but the path from the URL
        baseUrl = @$.URI(baseUrl).path()
      else
        # Attempt to use HTTP_HOST and fallback to SERVER_NAME
        domain = request?.host || @config.get('domain')

      # Add the protocol and domain to the base URL
      baseUrl = "#{protocol}://#{domain}#{port}#{baseUrl}"

    baseUrl

  site: (uri = '', protocol = null, index = true, request) ->
    # Chop off possible scheme, host, port, user and pass parts
    path = @$._s.trim(uri, '/').replace(/^[-a-z0-9+.]+?:\/\/[^\/]+?\/?/g, '')

    if not /^[ -~\t\n\r]+$/.test path
      path = path.replace(
        /([^\/]+)/g
       ->
         encodeURIComponent(match)
      )

    @base(protocol, index, request) + path
}