var str_replace,
  __hasProp = {}.hasOwnProperty;

str_replace = function(search, replace, subject, count) {
  /*
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Gabriel Paderni
  // +   improved by: Philip Peterson
  // +   improved by: Simon Willison (http://simonwillison.net)
  // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   bugfixed by: Anton Ongson
  // +      input by: Onno Marsman
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    tweaked by: Onno Marsman
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   input by: Oleg Eremeev
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Oleg Eremeev
  // %          note 1: The count parameter must be passed as a string in order
  // %          note 1:  to find a global variable in which the result will be given
  // *     example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
  // *     returns 1: 'Kevin.van.Zonneveld'
  // *     example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
  // *     returns 2: 'hemmo, mars'
  */

  var f, i, j, r, ra, repl, s, sa, temp, v;
  j = 0;
  temp = '';
  repl = '';
  f = [].concat(search);
  r = [].concat(replace);
  s = subject;
  ra = Object.prototype.toString.call(r) === '[object Array]';
  sa = Object.prototype.toString.call(s) === '[object Array]';
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }
  for (i in s) {
    v = s[i];
    if (!s[i]) {
      continue;
    }
    for (j in f) {
      v = f[j];
      temp = s[i] + '';
      repl = (ra ? (r[j] !== undefined ? r[j] : "") : r[0]);
      s[i] = temp.split(f[j]).join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  if (sa) {
    return s;
  } else {
    return s[0];
  }
};

module.exports = {
  $deps: [
    'Url', {
      '_s': 'underscore.string'
    }, {
      '_': 'lodash'
    }, {
      'XRegExp': ['xregexp', 'XRegExp']
    }
  ],
  $static: {
    REGEX_GROUP: '<([^>]+)>|(?:\\([^(]+\\))+?|(?:\\([^]+\\))+',
    REGEX_SUB: '\\(([a-zA-Z0-9_/<>()\\-]+)\\)',
    REGEX_SEGMENT: '[^/.,;?\\n]+',
    REGEX_ESCAPE: '[#.+*?[^\\]${}=!|]',
    defaultProtocol: 'http://',
    defaultAction: 'index',
    localhosts: [false, '', 'local', 'localhost'],
    routes: {},
    $setup: function() {
      if (this.$._.isString(this.REGEX_GROUP)) {
        this.REGEX_GROUP = this.$.XRegExp(this.REGEX_GROUP, 'g');
      }
      if (this.$._.isString(this.REGEX_SUB)) {
        return this.REGEX_SUB = this.$.XRegExp(this.REGEX_SUB);
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
      expression = this.$.XRegExp.replace(uri, this.REGEX_ESCAPE, '\\\\$0', 'all');
      if (expression.indexOf('(') !== -1) {
        expression = str_replace(['(', ')'], ['(', ')?'], expression);
      }
      expression = str_replace(['<', '>'], ['(?<', '>' + this.REGEX_SEGMENT + ')'], expression);
      if (this.$._.size(regex)) {
        search = [];
        replace = [];
        for (key in regex) {
          value = regex[key];
          search.push("<" + key + ">" + this.REGEX_SEGMENT);
          replace.push("<" + key + ">" + value);
        }
        expression = str_replace(search, replace, expression);
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
    if (!this.$._.isFunction(callback)) {
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
    if (!this.$._.isEmpty(params['controller'])) {
      params['controller'] = params['controller'].toLowerCase();
    }
    if (!this.$._.isEmpty(params['directory'])) {
      params['directory'] = params['directory'].toLowerCase();
    }
    if (this._filters) {
      _ref1 = this._filters;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        callback = _ref1[_i];
        _return = callback.call(this, params, request);
        if (_return === false) {
          return false;
        } else if (this.$._.isArray(_return)) {
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
    var compile, defaults, host, pairs, pattern, sub, uri,
      _this = this;
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
    compile = function(portion, required) {
      var missing, result;
      missing = [];
      result = _this.$.XRegExp.replace(portion, pattern, function(match, param) {
        var _match, _result;
        if (match.charAt(0) === '<') {
          if (params[param] !== void 0) {
            required = required || _this.$._.isEmpty(defaults[param]) || params[param] !== defaults[param];
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
    uri = compile(this._uri, true)[0];
    uri = this.$.XRegExp.replace(this.$._s.rtrim(uri, '/'), this.$.XRegExp('/+'), '/', 'all');
    if (this.isExternal()) {
      host = this._defaults.host;
      if (host && host.indexOf('://') === -1) {
        host = this.$class.defaultProtocol + host;
      }
      uri = this.$._s.rtrim(host, '/') + '/' + uri;
    }
    return uri.replace(/[()]/g, '');
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
