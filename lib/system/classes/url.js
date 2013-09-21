var slugg;

slugg = require('slugg');

sx.factory('Url', {
  $singleton: true,
  title: function(name, separator) {
    if (separator == null) {
      separator = '-';
    }
    name = slugg(name);
    if (separator !== '-') {
      name.replace(/-/g, separator);
    }
    return name;
  },
  site: function(name) {},
  route: function(name) {}
});
