
var Route;

Route = factory('route', require('../lib/system/classes/route.js'));

module.exports = {
  'route': {
    'get throws exception if route do not exist': function() {
      return expect(function() {
        return Route.get('HAHAHAHAHAHAHAHAHA');
      }).to.throwException();
    },
    'find returns routes name or false if do not exist': function() {
      var route;
      route = Route.set('flamingo_people', 'flamingo/dance');
      expect(Route.find(route)).to.equal('flamingo_people');
      route = Route.create('dance/dance');
      return expect(Route.find(route)).to.equal(false);
    },
    'constructor returns if uri is null': function() {
      var route, spy;
      spy = sinon.spy(Route, 'compile');
      route = new Route;
      expect(route._uri).to.equal('');
      expect(route.regex).to.eql([]);
      expect(route._defaults).to.eql({
        'action': 'index',
        'host': false
      });
      expect(route.routeRegex).to.equal('');
      expect(spy.called).to.equal(false);
      return Route.compile.restore();
    },
    'constructor only changes regex if passed a regex': function() {
      var route, uri;
      uri = '<controller>/<action>';
      route = new Route(uri, []);
      expect(route.regex).to.eql([]);
      route = new Route(uri, null);
      return expect(route.regex).to.eql([]);
    },
    'uses custom regex passed to constructor': function() {
      var regex, route;
      regex = {
        'id': '[0-9]{1,2}'
      };
      route = Route.create('(<controller>(/<action>(/<id>)))', regex);
      expect(route.regex).to.equal(regex);
      return expect(route.routeRegex.toString()).to.contain(regex.id);
    },
    'matches returns false on failure': function() {
      var match, route, uri;
      uri = 'projects/(<project_id>/(<controller>(/<action>(/<id>))))';
      match = 'apple/pie';
      route = new Route(uri);
      return expect(route.matches({
        path: match
      })).to.equal(false);
    },
    'matches returns array of parameters on successful match': function() {
      var a, c, matches, req, route, uri;
      uri = '(<controller>(/<action>(/<id>)))';
      c = 'welcome';
      a = 'index';
      req = {
        path: 'welcome/index'
      };
      route = new Route(uri);
      matches = route.matches(req);
      expect(matches).to.be.an('object');
      expect(matches).to.have.property('controller');
      expect(matches).to.have.property('action');
      expect(matches).to.not.have.property('id');
      expect(matches.controller).to.equal(c);
      return expect(matches.action).to.equal(a);
    },
    'defaults are used if params arent specified': function() {
      var a, c, default_uri, defaults, matches, regex, req, route, test_uri, test_uri_array, uri;
      uri = '<controller>(/<action>(/<id>))';
      regex = null;
      defaults = {
        'controller': 'welcome',
        'action': 'index'
      };
      c = 'welcome';
      a = 'index';
      test_uri = 'unit/test/1';
      test_uri_array = {
        'controller': 'unit',
        'action': 'test',
        'id': '1'
      };
      default_uri = 'welcome';
      route = new Route(uri, regex);
      route.defaults(defaults);
      expect(route._defaults).to.equal(defaults);
      req = {
        path: default_uri
      };
      matches = route.matches(req);
      expect(matches).to.be.an('object');
      expect(matches).to.have.property('controller');
      expect(matches).to.have.property('action');
      expect(matches).to.not.have.property('id');
      expect(matches.controller).to.equal(c);
      expect(matches.action).to.equal(a);
      expect(route.uri(test_uri_array)).to.equal(test_uri);
      expect(route.uri()).to.equal(default_uri);
      expect(function() {
        route.defaults({
          'action': 'index'
        });
        return route.uri({
          'action': 'test'
        });
      }).to.throwException();
      uri = '(<controller>(/<action>(/<id>)))';
      default_uri = '';
      route = new Route(uri, regex);
      route.defaults(defaults);
      req = {
        path: default_uri
      };
      matches = route.matches(req);
      expect(matches).to.be.an('object');
      expect(matches).to.have.property('controller');
      expect(matches).to.have.property('action');
      expect(matches).to.not.have.property('id');
      expect(matches.controller).to.equal(c);
      expect(matches.action).to.equal(a);
      expect(route.uri(test_uri_array)).to.equal(test_uri);
      return expect(route.uri()).to.equal(default_uri);
    },
    'optional groups containing specified params': function() {
      var option, options, route, _i, _len, _results;
      options = [
        {
          uri: '(<controller>(/<action>(/<id>)))',
          defaults: {
            'controller': 'welcome',
            'action': 'index'
          },
          params: {
            'id': '1'
          },
          expected: 'welcome/index/1'
        }, {
          uri: '<controller>(/<action>(/<id>))',
          defaults: {
            'controller': 'welcome',
            'action': 'index'
          },
          params: {
            'action': 'foo'
          },
          expected: 'welcome/foo'
        }, {
          uri: '<controller>(/<action>(/<id>))',
          defaults: {
            'controller': 'welcome',
            'action': 'index'
          },
          params: {
            'action': 'index'
          },
          expected: 'welcome'
        }, {
          uri: 'api(/<version>)/const(/<id>)(/<custom>)',
          defaults: {
            'version': 1
          },
          params: null,
          expected: 'api/const'
        }, {
          uri: 'api(/<version>)/const(/<id>)(/<custom>)',
          defaults: {
            'version': 1
          },
          params: {
            'version': 9
          },
          expected: 'api/9/const'
        }, {
          uri: 'api(/<version>)/const(/<id>)(/<custom>)',
          defaults: {
            'version': 1
          },
          params: {
            'id': 2
          },
          expected: 'api/const/2'
        }, {
          uri: 'api(/<version>)/const(/<id>)(/<custom>)',
          defaults: {
            'version': 1
          },
          params: {
            'custom': 'x'
          },
          expected: 'api/const/x'
        }, {
          uri: '(<controller>(/<action>(/<id>)(/<type>)))',
          defaults: {
            'controller': 'test',
            'action': 'index',
            'type': 'html'
          },
          params: {
            'type': 'json'
          },
          expected: 'test/index/json'
        }, {
          uri: '(<controller>(/<action>(/<id>)(/<type>)))',
          defaults: {
            'controller': 'test',
            'action': 'index',
            'type': 'html'
          },
          params: {
            'id': 123
          },
          expected: 'test/index/123'
        }, {
          uri: '(<controller>(/<action>(/<id>)(/<type>)))',
          defaults: {
            'controller': 'test',
            'action': 'index',
            'type': 'html'
          },
          params: {
            'id': 123,
            'type': 'html'
          },
          expected: 'test/index/123'
        }, {
          uri: '(<controller>(/<action>(/<id>)(/<type>)))',
          defaults: {
            'controller': 'test',
            'action': 'index',
            'type': 'html'
          },
          params: {
            'id': 123,
            'type': 'json'
          },
          expected: 'test/index/123/json'
        }
      ];
      _results = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        route = new Route(option.uri, null);
        route.defaults(option.defaults);
        expect(route.uri(option.params)).to.equal(option.expected);
        _results.push(route = null);
      }
      return _results;
    },
    'defaults are not used if param is identical': function() {
      var route;
      route = new Route('(<controller>(/<action>(/<id>)))');
      route.defaults({
        'controller': 'welcome',
        'action': 'index'
      });
      expect(route.uri({
        'controller': 'welcome'
      })).to.equal('');
      return expect(route.uri({
        'controller': 'welcome2'
      })).to.equal('welcome2');
    },
    'required parameters are needed': function() {
      var matches, matches_route1, matches_route2, request, route, uri;
      uri = 'admin(/<controller>(/<action>(/<id>)))';
      matches_route1 = 'admin';
      matches_route2 = 'admin/users/add';
      route = new Route(uri);
      request = {
        path: ''
      };
      expect(route.matches(request)).to.equal(false);
      request = {
        path: matches_route1
      };
      matches = route.matches(request);
      expect(matches).to.be.an('object');
      request = {
        path: matches_route2
      };
      matches = route.matches(request);
      expect(matches).to.be.an('object');
      expect(matches).to.have.property('controller');
      return expect(matches).to.have.property('action');
    },
    'reverse routing returns routes uri if route is static': function() {
      var regex, route, target_uri, uri, uri_params;
      uri = 'info/about_us';
      regex = null;
      target_uri = 'info/about_us';
      uri_params = {
        'some': 'random',
        'params': 'to confuse'
      };
      route = new Route(uri, regex);
      return expect(route.uri(uri_params)).to.equal(target_uri);
    },
    'uri throws exception if required params are missing': function() {
      var option, options, route, _i, _len, _results;
      options = [
        {
          uri: '<controller>(/<action>)',
          regex: null,
          uri_array: {
            'action': 'awesome-action'
          }
        }, {
          uri: '(<controller>(/<action>))',
          regex: null,
          uri_array: {
            'action': 'awesome-action'
          }
        }
      ];
      _results = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        route = new Route(option.uri, option.regex);
        expect(function() {
          return route.uri(option.uri_array);
        }).to.throwException();
        _results.push(route = null);
      }
      return _results;
    },
    'uri fills required uri segments from params': function() {
      var route, uri, uri_array1, uri_array2, uri_string1, uri_string2;
      uri = '<controller>/<action>(/<id>)';
      uri_string1 = 'users/edit';
      uri_array1 = {
        'controller': 'users',
        'action': 'edit'
      };
      uri_string2 = 'users/edit/god';
      uri_array2 = {
        'controller': 'users',
        'action': 'edit',
        'id': 'god'
      };
      route = new Route(uri);
      expect(route.uri(uri_array1)).to.equal(uri_string1);
      expect(route.uri(uri_array2)).to.equal(uri_string2);
      return route = null;
    },
    'composing url from route': function() {
      Route.set('foobar', '(<controller>(/<action>(/<id>)))').defaults({
        'controller': 'welcome'
      });
      expect(Route.url('foobar')).to.equal('/');
      expect(Route.url('foobar', {
        'controller': 'news',
        'action': 'view',
        'id': 42
      })).to.equal('/news/view/42');
      Route.$.Url.config.set('domain', 'example.com');
      return expect(Route.url('foobar', {
        'controller': 'news'
      }, 'https')).to.equal('https://example.com/news');
    },
    'compile uses custom regex if specified': function() {
      var compiled;
      compiled = Route.compile('<controller>(/<action>(/<id>))', {
        'controller': '[a-z]+',
        'id': '\\d+'
      });
      return expect(compiled.toString()).to.equal('/^([a-z]+)(?:\\/([^\\/\\.,;\\?\\n]+)(?:\\/(\\d+))?)?$/');
    },
    'is external route from host': function() {
      Route.set('internal', 'local/test/route').defaults({
        'controller': 'foo',
        'action': 'bar'
      });
      Route.set('external', 'local/test/route').defaults({
        'controller': 'foo',
        'action': 'bar',
        'host': 'http://example.com'
      });
      expect(Route.get('internal').isExternal()).to.be(false);
      return expect(Route.get('external').isExternal()).to.be(true);
    },
    'external route includes params in uri': function() {
      var option, options, _i, _len, _results;
      options = [
        {
          route: '<controller>/<action>',
          defaults: {
            'controller': 'foo',
            'action': 'bar',
            'host': 'example.com'
          },
          expected_uri: 'http://example.com/foo/bar'
        }, {
          route: '<controller>/<action>',
          defaults: {
            'controller': 'foo',
            'action': 'bar',
            'host': 'http://example.com'
          },
          expected_uri: 'http://example.com/foo/bar'
        }, {
          route: 'foo/bar',
          defaults: {
            'controller': 'foo',
            'host': 'http://example.com'
          },
          expected_uri: 'http://example.com/foo/bar'
        }
      ];
      _results = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        Route.set('test', option.route).defaults(option.defaults);
        _results.push(expect(Route.get('test').uri()).to.equal(option.expected_uri));
      }
      return _results;
    },
    'route filter modify params': function() {
      var option, options, params, req, route, _i, _len, _results;
      options = [
        {
          route: '<controller>/<action>',
          defaults: {
            'controller': 'Test',
            'action': 'same'
          },
          filter: function(params) {
            params['action'] = 'modified';
            return params;
          },
          uri: 'test/different',
          expected_params: {
            'controller': 'test',
            'action': 'modified'
          }
        }, {
          route: '<controller>/<action>',
          defaults: {
            'controller': 'test',
            'action': 'same'
          },
          filter: function() {
            return false;
          },
          uri: 'test/fail',
          expected_params: false
        }
      ];
      _results = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        route = new Route(option.route);
        req = {
          path: option.uri
        };
        params = route.defaults(option.defaults).filter(option.filter).matches(req);
        expect(params).to.eql(option.expected_params);
        _results.push(route = null);
      }
      return _results;
    },
    'accepts weird routes': function() {
      var option, options, req, route, _i, _len, _results;
      options = [
        {
          route: 'api-<version>/<cmd>',
          regex: {
            'version': '[0-9\\.]{3}',
            'cmd': '[a-z_]+'
          },
          params: {
            'version': '1.0',
            'cmd': 'fetch_all'
          },
          defaults: {},
          expected_uri: 'api-1.0/fetch_all'
        }, {
          route: '/admin/(user/(edit/<id>/)(album/<albumId>/)<session>/)test',
          regex: null,
          params: {
            id: 4,
            albumId: 2,
            session: 'qwjdoqiwdasdj12asdiaji198a'
          },
          defaults: {},
          expected_uri: '/admin/user/edit/4/album/2/qwjdoqiwdasdj12asdiaji198a/test'
        }, {
          route: '/admin/(user/(edit/<id>/)(album/<albumId>/)<session>/)test',
          regex: null,
          params: {
            id: 4,
            session: 'qwjdoqiwdasdj12asdiaji198a'
          },
          defaults: {},
          expected_uri: '/admin/user/edit/4/qwjdoqiwdasdj12asdiaji198a/test'
        }, {
          route: '/admin/(user/(edit/<id>/)(album/<albumId>/)<session>/)test',
          regex: null,
          params: {
            albumId: 2,
            session: 'qwjdoqiwdasdj12asdiaji198a'
          },
          defaults: {},
          expected_uri: '/admin/user/album/2/qwjdoqiwdasdj12asdiaji198a/test'
        }, {
          route: '/admin/(user/(edit/<id>/)(album/<albumId>/)<session>/)test',
          regex: null,
          params: {},
          defaults: {},
          expected_uri: '/admin/test'
        }, {
          route: '/site/int/en(/<controller>-(<action>_(<id>)).html)',
          regex: null,
          params: {
            controller: 'after',
            action: 'taste',
            id: 'raw'
          },
          defaults: {},
          expected_uri: '/site/int/en/after-taste_raw.html'
        }, {
          route: '/api/<version>/<command>(.<format>)',
          regex: {
            version: '[1-3]{1}',
            format: '(json|xml)'
          },
          params: {
            version: '1',
            command: 'users',
            format: 'json'
          },
          defaults: {},
          expected_uri: '/api/1/users.json'
        }
      ];
      _results = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        route = new Route(option.route, option.regex);
        req = {
          path: option.expected_uri
        };
        route.defaults(option.defaults);
        expect(route.matches(req)).to.eql(option.params);
        expect(route.uri(option.params)).to.equal(option.expected_uri);
        _results.push(route = null);
      }
      return _results;
    },
    'prototype should not be changed': function() {
      var filter1, filter2, route1, route2;
      route1 = new Route;
      filter1 = function() {
        return false;
      };
      filter2 = function() {
        return ['asdf'];
      };
      route1.filter(filter1).defaults({
        only: 'one'
      });
      route2 = new Route;
      route2.filter(filter2).defaults({
        not: 'two'
      });
      expect(route1._filters).to.eql([filter1]);
      expect(route2._filters).to.eql([filter2]);
      expect(route2._defaults).to.eql({
        not: 'two'
      });
      expect(route1._defaults).to.eql({
        only: 'one'
      });
      return expect(Route.prototype._filters).to.eql([]);
    }
  }
};
