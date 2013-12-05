module.exports = {
  $singleton: true,
  $deps: [
    'Bootstrap', {
      'slugg': 'slugg'
    }, {
      '_s': 'underscore.string'
    }
  ],
  title: function(name, separator) {
    if (separator == null) {
      separator = '-';
    }
    name = this.$.slugg(name);
    if (separator !== '-') {
      name.replace(/-/g, separator);
    }
    return name;
  },
  base: function(protocol, index) {
    var base_url;
    if (protocol == null) {
      protocol = null;
    }
    if (index == null) {
      index = false;
    }
    base_url = '/';
    /*
    
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
    */

    return base_url;
  },
  site: function(uri, protocol, index) {
    var path;
    if (uri == null) {
      uri = '';
    }
    if (protocol == null) {
      protocol = null;
    }
    if (index == null) {
      index = true;
    }
    path = this.$._s.trim(uri, '/').replace(/^[-a-z0-9+.]+?:\/\/[^\/]+?\/?/g, '');
    if (!/^[ -~\t\n\r]+$/.test(path)) {
      path = path.replace(/([^\/]+)/g, function() {
        return encodeURIComponent(match);
      });
    }
    return this.base(protocol, index) + path;
  }
};
