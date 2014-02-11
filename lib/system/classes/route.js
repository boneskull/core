var __hasProp = {}.hasOwnProperty;

module.exports = {
  $deps: [
    'Url', 'Utils', {
      '_s': 'underscore.string'
    }, {
      'XRegExp': ['xregexp', 'XRegExp']
    }
  ],
  $static: {
    REGEX_GROUP: '<([^>]+)>|(?:\\([^(]+\\))+?|(?:\\([^]+\\))+',
    REGEX_SUB: '\\(([a-zA-Z0-9_\\/<>\\(\\)\\-\\.]+)\\)',
    REGEX_SEGMENT: '[^\\/\\.,;\\?\\n]+',
    REGEX_ESCAPE: '[\\/\\#\\.\\+\\*\\?\\[\\^\\]\\$\\{\\}\\=\\!\\|]+',
    defaultProtocol: 'http://',
    defaultAction: 'index',
    localhosts: [false, '', 'local', 'localhost'],
    routes: {},
    $setup: function() {
      if (this.$.Utils.isString(this.REGEX_GROUP)) {
        this.REGEX_GROUP = this.$.XRegExp(this.REGEX_GROUP, 'g');
      }
      if (this.$.Utils.isString(this.REGEX_SUB)) {
        this.REGEX_SUB = this.$.XRegExp(this.REGEX_SUB);
      }
      if (this.$.Utils.isString(this.REGEX_ESCAPE)) {
        return this.REGEX_ESCAPE = this.$.XRegExp(this.REGEX_ESCAPE, 'g');
      }
    },
    set: function(name, uri, regex) {
      return this.routes[name] = new this(uri, regex);
    },
    get: function(name) {
      if (!this.routes[name]) {
        throw new Error("The requested route does not exist: " + name);
      }
      return this.routes[name];
    },
    find: function(route) {
      var k, v, _ref;
      if (route && (!route instanceof this)) {
        throw new Error("You must pass in a router to the name function");
      }
      _ref = this.routes;
      for (k in _ref) {
        v = _ref[k];
        if (v === route) {
          return k;
        }
      }
      return false;
    },
    url: function(name, params, protocol, request) {
      var route;
      if (params == null) {
        params = {};
      }
      if (protocol == null) {
        protocol = false;
      }
      if (request == null) {
        request = null;
      }
      route = this.get(name);
      if (route.isExternal()) {
        return route.uri(params);
      } else if (this.$.Url) {
        return this.$.Url.site(route.uri(params), protocol, request);
      }
    },
    compile: function(uri, regex) {
      var expression, key, replace, search, value;
      if (regex == null) {
        regex = {};
      }
      expression = this.$.XRegExp.replace(uri, this.REGEX_ESCAPE, '\\$&', 'all');
      if (expression.indexOf('(') !== -1) {
        expression = this.$.Utils.strReplace(['(', ')'], ['(', ')?'], expression);
      }
      expression = this.$.Utils.strReplace(['<', '>'], ['(?<', '>' + this.REGEX_SEGMENT + ')'], expression);
      if (this.$.Utils.size(regex)) {
        search = [];
        replace = [];
        for (key in regex) {
          value = regex[key];
          search.push("<" + key + ">" + this.REGEX_SEGMENT);
          replace.push("<" + key + ">" + value);
        }
        expression = this.$.Utils.strReplace(search, replace, expression);
      }
      return this.$.XRegExp('^' + expression + '$', 'nx');
    }
  },
  construct: function(uri, regex) {
    if (!uri) {
      return;
    }
    this._uri = uri;
    if (regex) {
      this.regex = regex;
    }
    return this.routeRegex = this.$class.compile(uri, regex);
  },
  defaults: function(defaults) {
    if (defaults === null) {
      return this._defaults;
    }
    this._defaults = defaults;
    return this;
  },
  filter: function(callback) {
    if (!this.$.Utils.isFunction(callback)) {
      throw new Error('Invalid Route.filter specified, it must be a function');
    }
    this._filters = [].concat(this._filters, callback);
    return this;
  },
  matches: function(request) {
    var callback, key, matches, params, uri, value, _i, _len, _ref, _ref1, _return;
    uri = this.$._s.rtrim((request && (request.path != null) ? request.path : "" + request), '/');
    matches = this.$.XRegExp.exec(uri, this.routeRegex);
    if (matches === null) {
      return false;
    }
    params = {};
    for (key in matches) {
      if (!__hasProp.call(matches, key)) continue;
      value = matches[key];
      if (+key || key === '0' || value === void 0 || (key === 'index' || key === 'input')) {
        continue;
      }
      params[key] = value;
    }
    _ref = this._defaults;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      value = _ref[key];
      if (params[key] === void 0 || params[key] === '') {
        params[key] = value;
      }
    }
    if (!this.$.Utils.isEmpty(params['controller'])) {
      params['controller'] = params['controller'].toLowerCase();
    }
    if (!this.$.Utils.isEmpty(params['directory'])) {
      params['directory'] = params['directory'].toLowerCase();
    }
    if (this._filters) {
      _ref1 = this._filters;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        callback = _ref1[_i];
        _return = callback.call(this, params, request);
        if (_return === false) {
          return false;
        } else if (this.$.Utils.isArray(_return)) {
          params = _return;
        }
      }
    }
    return params;
  },
  isExternal: function() {
    var host;
    host = this._defaults.host || false;
    return this.$class.localhosts.indexOf(host) === -1;
  },
  uri: function(params) {
    var compile, defaults, host, pairs, pattern, sub, uri;
    if (params == null) {
      params = {};
    }
    defaults = this._defaults;
    pattern = this.$class.REGEX_GROUP;
    sub = this.$class.REGEX_SUB;
    pairs = function(str) {
      if (str.indexOf('(') === -1 && str.indexOf(')') === -1) {
        return true;
      }
      return str.split(')').length === str.split('(').length && str.indexOf('(') < str.indexOf(')');
    };
    compile = (function(_this) {
      return function(portion, required) {
        var missing, result;
        missing = [];
        result = _this.$.XRegExp.replace(portion, pattern, function(match, param) {
          var _match, _result;
          if (match.charAt(0) === '<') {
            if (params[param] !== void 0) {
              required = required || _this.$.Utils.isEmpty(defaults[param]) || params[param] !== defaults[param];
              return params[param];
            }
            if (defaults[param] !== void 0) {
              return defaults[param];
            }
            missing.push(param);
          } else {
            _match = sub.exec(match);
            if (_match != null ? _match[1] : void 0) {
              if (!pairs(_match[1])) {
                _match = sub.exec(portion);
                if (_match != null ? _match[1] : void 0) {
                  _result = compile(_match[1], false);
                }
              } else {
                _result = compile(_match[1], false);
              }
              if ((_result != null ? _result[1] : void 0) === true) {
                required = true;
                return _result[0];
              }
            }
          }
          return '';
        }, 'all');
        if (required && missing.length) {
          throw new Error("Required route parameter is missing: " + missing);
        }
        return [result, required];
      };
    })(this);
    uri = compile(this._uri, true)[0];
    uri = this.$.XRegExp.replace(this.$._s.rtrim(uri, '/'), this.$.XRegExp('/+'), '/', 'all');
    if (this.isExternal()) {
      host = this._defaults.host;
      if (host && host.indexOf('://') === -1) {
        host = this.$class.defaultProtocol + host;
      }
      uri = this.$._s.rtrim(host, '/') + '/' + uri;
    }
    return uri;
  },
  _filters: [],
  _uri: '',
  regex: [],
  _defaults: {
    'action': 'index',
    host: false
  },
  routeRegex: ''
};
