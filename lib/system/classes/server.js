module.exports = {
  $deps: [
    'Utils', {
      'spdy': 'spdy'
    }, {
      'http': 'http'
    }, {
      'https': 'http'
    }, {
      'restify': 'restify'
    }, {
      'express': 'express'
    }, {
      'tls': 'tls'
    }, {
      'jsonrpc2': 'json-rpc2'
    }
  ],
  $static: {
    servers: {},
    factory: function(name, type, options) {
      return this.servers[name] = new this(type, options);
    }
  },
  $extend: 'EventEmitter',
  construct: function(type, options) {
    this.type = type != null ? type : 'http';
    this.options = options != null ? options : {};
    this.$super();
    switch (type.toLowerCase()) {
      case 'spdy':
        this.options = {
          ca: options.ca,
          cert: options.cert,
          key: options.key
        };
        this.server = this.$.spdy.createServer(this.options);
        break;
      case 'restify':
        this.options = options;
        this.server = this.$.restify.createServer(this.options);
        break;
      case 'https':
        this.options = {
          ca: options.ca,
          cert: options.cert,
          key: options.key,
          passphrase: options.passphrase
        };
        this.server = this.$.https.createServer(this.options);
        break;
      case 'tls':
        this.options = {};
        this.server = this.$.tls.createServer(this.options);
        break;
      case 'jsonrpc':
        this.options = {};
        this.server = this.$.jsonrpc2.Server.create(this.options);
        break;
      case 'express':
        this.options = options;
        this.server = this.$.express();
        break;
      case 'http':
        this.options = {};
        this.server = this.$.http.createServer();
        break;
      default:
        throw new Error(this.$.Utils.sprintf('Invalid server type: "%s"', type));
    }
  }
};
