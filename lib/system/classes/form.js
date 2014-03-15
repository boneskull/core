module.exports = {
  $singleton: true,
  $deps: [
    'Utils', {
      'parse': ['url', 'parse']
    }, {
      'querystring': 'querystring'
    }, {
      'im': ['http', 'IncomingMessage']
    }, {
      'forms': 'forms'
    }, {
      'formidable': ['formidable', 'IncomingForm']
    }
  ],
  parse: function(request) {
    var d, form;
    if (request == null) {
      request = null;
    }
    form = new this.$.formidable();
    d = this.$.Utils.Promise.defer();
    if (request != null) {
      form.parse(request, function(err, fields, files) {
        if (err) {
          return d.reject(err, form);
        } else {
          return d.resolve(fields, files, form);
        }
      });
    } else {
      d.reject('You must pass a request to the parse method', form);
    }
    return d.promise;
  },
  get: function() {
    return this.$.forms;
  },
  _handle: function(form, obj, callbacks) {
    var buffer, qs;
    if (typeof obj === "undefined" || obj === null || (typeof obj === "object" && Object.keys(obj).length === 0)) {
      return (callbacks.empty || callbacks.other)(form);
    } else if ((typeof obj.body !== "undefined" || typeof obj.url !== "undefined") && typeof obj.method !== "undefined") {
      if (obj.method === "GET") {
        qs = this.$.parse(obj.url).query;
        return this._handle(form, this.$.querystring.parse(qs), callbacks);
      } else if (obj.method === "POST" || obj.method === "PUT") {
        if (obj.body) {
          return this._handle(form, obj.body, callbacks);
        } else {
          buffer = "";
          obj.addListener("data", function(chunk) {
            return buffer += chunk;
          });
          return obj.addListener("end", (function(_this) {
            return function() {
              return _this._handle(form, _this.$.querystring.parse(buffer), callbacks);
            };
          })(this));
        }
      } else {
        throw new Error("Cannot handle request method: " + obj.method);
      }
    } else if (typeof obj === "object") {
      return form.bind(obj).validate(function(err, f) {
        if (f.isValid()) {
          return (callbacks.success || callbacks.other)(f);
        } else {
          return (callbacks.error || callbacks.other)(f);
        }
      });
    } else {
      throw new Error("Cannot handle type: " + typeof obj);
    }
  },
  validate: function(request, form) {
    var d, e;
    d = this.$.Utils.Promise.defer();
    try {
      this._handle(form, request, {
        success: function(f) {
          return f.validate(function(err) {
            if (err) {
              return d.reject(err, f);
            } else {
              return d.resolve(f);
            }
          });
        },
        error: d.reject
      });
    } catch (_error) {
      e = _error;
      d.reject(e.toString(), form);
    }
    return d.promise;
  }
};
