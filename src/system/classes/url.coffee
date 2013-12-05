module.exports = {
  $singleton: true
  $deps: [
    'Bootstrap',
    {'slugg': 'slugg'},
    {'_s': 'underscore.string'},
  ]

  title: (name, separator = '-') ->
    name = @$.slugg(name)

    if separator isnt '-'
      name.replace(/-/g, separator)

    name

  base: (protocol = null, index = false)->
    # Start with the configured base URL
    base_url = '/'
    ###

    if protocol is true
      # Use the initial request to get the protocol
      protocol = Request.initial

    if (protocol instanceof Request)
    {
            if ( ! protocol->secure())
            {
                    // Use the current protocol
                    list(protocol) = explode('/', strtolower(protocol->protocol()));
            }
            else
            {
                    protocol = 'https';
            }
    }

    if ( ! protocol)
    {
            // Use the configured default protocol
            protocol = parse_url(base_url, PHP_URL_SCHEME);
    }

    if (index === TRUE AND ! empty(Kohana.index_file))
    {
            // Add the index file to the URL
            base_url .= Kohana.index_file.'/';
    }

    if (is_string(protocol))
    {
            if (port = parse_url(base_url, PHP_URL_PORT))
            {
                    // Found a port, make it usable for the URL
                    port = ':'.port;
            }

            if (domain = parse_url(base_url, PHP_URL_HOST))
            {
                    // Remove everything but the path from the URL
                    base_url = parse_url(base_url, PHP_URL_PATH);
            }
            else
            {
                    // Attempt to use HTTP_HOST and fallback to SERVER_NAME
                    domain = isset(_SERVER['HTTP_HOST']) ? _SERVER['HTTP_HOST'] : _SERVER['SERVER_NAME'];
            }

            // Add the protocol and domain to the base URL
            base_url = protocol.'://'.domain.port.base_url;
    }
    ###
    base_url

  site: (uri = '', protocol = null, index = true) ->
    # Chop off possible scheme, host, port, user and pass parts
    path = @$._s.trim(uri, '/').replace(/^[-a-z0-9+.]+?:\/\/[^\/]+?\/?/g, '')

    if not /^[ -~\t\n\r]+$/.test path
      path = path.replace(
        /([^\/]+)/g
       ->
         encodeURIComponent(match)
      )

    @base(protocol, index) + path
}