module.exports = {
  $deps: [
    {
      'Q': 'q'
    }, {
      'sprintf': 'sprintf-js'
    }, {
      '_': 'lodash'
    }
  ],
  $singleton: true,
  $setup: function() {
    this.$implement(this.$._);
    return this.$implement({
      sprintf: this.$.sprintf.sprintf,
      vsprintf: this.$.sprintf.vsprintf
    });
  },
  strReplace: function(search, replace, subject) {
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
      }
    }
    if (sa) {
      return s;
    } else {
      return s[0];
    }
  },
  promesifyAll: function(source, dest, only) {
    var hasOnly, k, v;
    if (only == null) {
      only = [];
    }
    hasOnly = only.length > 0;
    for (k in source) {
      v = source[k];
      if (hasOnly && (only.indexOf(k) === -1)) {
        continue;
      }
      if (!this.$._.isFunction(v)) {
        continue;
      }
      dest[k] = this.$.Q.nbind(v, source);
    }
  },
  noop: function() {}
};
