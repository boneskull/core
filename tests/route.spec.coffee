Route = factory('route', require '../lib/system/classes/route.js')

module.exports =
  'route':
    'get throws exception if route do not exist': ->
      expect(-> Route.get('HAHAHAHAHAHAHAHAHA')).to.throwException()

    'find returns routes name or false if do not exist': ->
      route = Route.set('flamingo_people', 'flamingo/dance')

      expect(Route.find(route)).to.equal('flamingo_people')

      route = Route.create('dance/dance')

      expect(Route.find(route)).to.equal(false)

    'constructor returns if uri is null': ->
      spy = sinon.spy(Route, 'compile')

      route = new Route

      expect(route._uri).to.equal('')
      expect(route.regex).to.eql([])
      expect(route._defaults).to.eql('action': 'index', 'host': false)
      expect(route.routeRegex).to.equal('')
      expect(spy.called).to.equal(false)

      Route.compile.restore()
    'constructor only changes regex if passed a regex': ->
      uri = '<controller>/<action>'

      route = new Route(uri, [])

      expect(route.regex).to.eql([])

      route = new Route(uri, null)

      expect(route.regex).to.eql([])

    'uses custom regex passed to constructor': ->
      regex = 'id': '[0-9]{1,2}'

      route = Route.create('(<controller>(/<action>(/<id>)))', regex)

      expect(route.regex).to.equal(regex)
      expect(route.routeRegex.toString()).to.contain(regex.id)

    'matches returns false on failure': ->
      uri = 'projects/(<project_id>/(<controller>(/<action>(/<id>))))'
      match = 'apple/pie'

      route = new Route(uri)

      expect(route.matches({path: match})).to.equal(false)

    'matches returns array of parameters on successful match' : ->
      uri = '(<controller>(/<action>(/<id>)))'
      c = 'welcome'
      a = 'index'
      req = {
        path: 'welcome/index'
      }

      route = new Route(uri)

      matches = route.matches(req)

      expect(matches).to.be.an('object')
      expect(matches).to.have.property('controller')
      expect(matches).to.have.property('action')
      expect(matches).to.not.have.property('id')
      expect(matches.controller).to.equal(c)
      expect(matches.action).to.equal(a)

    'defaults are used if params arent specified': ->
      uri = '<controller>(/<action>(/<id>))'
      regex = null
      defaults = 'controller': 'welcome', 'action': 'index'
      c = 'welcome'
      a = 'index'
      test_uri = 'unit/test/1'
      test_uri_array =
        'controller': 'unit'
        'action': 'test'
        'id': '1'
      default_uri = 'welcome'

      route = new Route(uri, regex)
      route.defaults(defaults)

      expect(route._defaults).to.equal(defaults)

      req = {
        path: default_uri
      }

      matches = route.matches(req)

      expect(matches).to.be.an('object')
      expect(matches).to.have.property('controller')
      expect(matches).to.have.property('action')
      expect(matches).to.not.have.property('id')
      expect(matches.controller).to.equal(c)
      expect(matches.action).to.equal(a)
      expect(route.uri(test_uri_array)).to.equal(test_uri)
      expect(route.uri()).to.equal(default_uri)
      expect(->
        route.defaults({'action': 'index'})
        route.uri({'action': 'test'})
      ).to.throwException()

      uri = '(<controller>(/<action>(/<id>)))'
      default_uri = ''

      route = new Route(uri, regex)
      route.defaults(defaults)

      req = {
        path: default_uri
      }

      matches = route.matches(req)

      expect(matches).to.be.an('object')
      expect(matches).to.have.property('controller')
      expect(matches).to.have.property('action')
      expect(matches).to.not.have.property('id')
      expect(matches.controller).to.equal(c)
      expect(matches.action).to.equal(a)
      expect(route.uri(test_uri_array)).to.equal(test_uri)
      expect(route.uri()).to.equal(default_uri)

    'optional groups containing specified params': ->

      options = [
        {
          uri: '(<controller>(/<action>(/<id>)))'
          defaults: {'controller': 'welcome', 'action': 'index'}
          params: {'id': '1'}
          expected: 'welcome/index/1'
        }
        {
          uri:'<controller>(/<action>(/<id>))'
          defaults: {'controller': 'welcome', 'action': 'index'}
          params: {'action': 'foo'}
          expected: 'welcome/foo'
        }
        {
          uri:'<controller>(/<action>(/<id>))'
          defaults: {'controller': 'welcome', 'action': 'index'}
          params: {'action': 'index'}
          expected: 'welcome'
        }
        {
          uri:'api(/<version>)/const(/<id>)(/<custom>)'
          defaults: {'version': 1}
          params: null,
          expected: 'api/const'
        }
        {
          uri:'api(/<version>)/const(/<id>)(/<custom>)'
          defaults: {'version': 1}
          params: {'version': 9}
          expected: 'api/9/const'
        }
        {
          uri:'api(/<version>)/const(/<id>)(/<custom>)'
          defaults: {'version': 1}
          params: {'id': 2}
          expected: 'api/const/2'
        }
        {
          uri:'api(/<version>)/const(/<id>)(/<custom>)'
          defaults: {'version': 1}
          params: {'custom': 'x'}
          expected: 'api/const/x'
        }
        {
          uri:'(<controller>(/<action>(/<id>)(/<type>)))'
          defaults: {'controller': 'test', 'action': 'index', 'type': 'html'}
          params: {'type': 'json'}
          expected: 'test/index/json'
        }
        {
          uri:'(<controller>(/<action>(/<id>)(/<type>)))'
          defaults: {'controller': 'test', 'action': 'index', 'type': 'html'}
          params: {'id': 123}
          expected: 'test/index/123'
        }
        {
          uri:'(<controller>(/<action>(/<id>)(/<type>)))'
          defaults: {'controller': 'test', 'action': 'index', 'type': 'html'}
          params: {'id': 123, 'type': 'html'}
          expected: 'test/index/123'
        }
        {
          uri:'(<controller>(/<action>(/<id>)(/<type>)))'
          defaults: {'controller': 'test', 'action': 'index', 'type': 'html'}
          params: {'id': 123, 'type': 'json'}
          expected: 'test/index/123/json'
        }
      ]

      for option in options
        route = new Route(option.uri, null)
        route.defaults(option.defaults)

        expect(route.uri(option.params)).to.equal(option.expected)

    'defaults are not used if param is identical': ->
      route = new Route('(<controller>(/<action>(/<id>)))')
      route.defaults(
        'controller': 'welcome'
        'action': 'index'
      )

      expect(route.uri('controller': 'welcome')).to.equal('')
      expect(route.uri('controller': 'welcome2')).to.equal('welcome2')

    'required parameters are needed': ->
      uri = 'admin(/<controller>(/<action>(/<id>)))'
      matches_route1 = 'admin'
      matches_route2 = 'admin/users/add'

      route = new Route(uri)

      request = {
        path: ''
      }

      expect(route.matches(request)).to.equal(false)

      request = {
        path: matches_route1
      }

      matches = route.matches(request)

      expect(matches).to.be.an('object')

      request = {
        path: matches_route2
      }

      matches = route.matches(request)

      expect(matches).to.be.an('object')
      expect(matches).to.have.property('controller')
      expect(matches).to.have.property('action')

    'reverse routing returns routes uri if route is static': ->
      uri = 'info/about_us'
      regex = null
      target_uri = 'info/about_us'
      uri_params = 'some': 'random', 'params': 'to confuse'

      route = new Route(uri, regex)

      expect(route.uri(uri_params)).to.equal(target_uri)

    'uri throws exception if required params are missing': ->
      options = [
        {
          uri      : '<controller>(/<action>)',
          regex    : null,
          uri_array: {'action': 'awesome-action'}
        }
        {
          uri      : '(<controller>(/<action>))',
          regex    : null,
          uri_array: {'action': 'awesome-action'}
        }
      ]

      for option in options
        route = new Route(option.uri, option.regex)

        expect(->
          route.uri(option.uri_array)
        ).to.throwException()

    'uri fills required uri segments from params': ->
      uri = '<controller>/<action>(/<id>)'
      uri_string1 = 'users/edit'
      uri_array1 = {
        'controller' :  'users',
        'action'     :  'edit',
      }
      uri_string2 = 'users/edit/god'
      uri_array2 = {
        'controller' :  'users',
        'action'     :  'edit',
        'id'         :  'god',
      }

      route = new Route(uri)

      expect(route.uri(uri_array1)).to.equal(uri_string1)
      expect(route.uri(uri_array2)).to.equal(uri_string2)

    'composing url from route': ->
      options = [
        {
          expected: '/'
        }
        {
          expected: '/news/view/42'
          params: {'controller': 'news', 'action': 'view', 'id': 42}
        }
        {
          expected: 'http://kohanaframework.org/news'
          params: {'controller': 'news'}
          protocol: 'http'
        }
      ]

      for option in options
        Route.set('foobar', '(<controller>(/<action>(/<id>)))').defaults('controller': 'welcome')

        expect(Route.url('foobar', option.params, option.protocol)).to.equal(option.expected)

###

	/**
	 * Provides test data for test_composing_url_from_route()
	 * @return array

	public function provider_composing_url_from_route()
	{
		return array(
			array('/'),
			array('/news/view/42', array('controller' => 'news', 'action' => 'view', 'id' => 42)),
			array('http://kohanaframework.org/news', array('controller' => 'news'), 'http')
		);
	}

	/**
	 * Tests Route::url()
	 *
	 * Checks the url composing from specific route via Route::url() shortcut
	 *
	 * @test
	 * @dataProvider provider_composing_url_from_route
	 * @param string $expected
	 * @param array $params
	 * @param boolean $protocol

	public function test_composing_url_from_route($expected, $params = NULL, $protocol = NULL)
	{
		Route::set('foobar', '(<controller>(/<action>(/<id>)))')
			->defaults(array(
				'controller' => 'welcome',
			)
		);

		$this->setEnvironment(array(
			'_SERVER' => array('HTTP_HOST' => 'kohanaframework.org'),
			'Kohana::$base_url' => '/',
			'Kohana::$index_file' => '',
		));

		$this->assertSame($expected, Route::url('foobar', $params, $protocol));
	}

	/**
	 * Tests Route::compile()
	 *
	 * Makes sure that compile will use custom regex if specified
	 *
	 * @test
	 * @covers Route::compile

	public function test_compile_uses_custom_regex_if_specificed()
	{
		$compiled = Route::compile(
			'<controller>(/<action>(/<id>))',
			array(
				'controller' => '[a-z]+',
				'id' => '\d+',
			)
		);

		$this->assertSame('#^(?P<controller>[a-z]+)(?:/(?P<action>[^/.,;?\n]++)(?:/(?P<id>\d+))?)?$#uD', $compiled);
	}

	/**
	 * Tests Route::is_external(), ensuring the host can return
	 * whether internal or external host

	public function test_is_external_route_from_host()
	{
		// Setup local route
		Route::set('internal', 'local/test/route')
			->defaults(array(
				'controller' => 'foo',
				'action'     => 'bar'
				)
			);

		// Setup external route
		Route::set('external', 'local/test/route')
			->defaults(array(
				'controller' => 'foo',
				'action'     => 'bar',
				'host'       => 'http://kohanaframework.org'
				)
			);

		// Test internal route
		$this->assertFalse(Route::get('internal')->is_external());

		// Test external route
		$this->assertTrue(Route::get('external')->is_external());
	}

	/**
	 * Provider for test_external_route_includes_params_in_uri
	 *
	 * @return array

	public function provider_external_route_includes_params_in_uri()
	{
		return array(
			array(
				'<controller>/<action>',
				array(
					'controller'  => 'foo',
					'action'      => 'bar',
					'host'        => 'kohanaframework.org'
				),
				'http://kohanaframework.org/foo/bar'
			),
			array(
				'<controller>/<action>',
				array(
					'controller'  => 'foo',
					'action'      => 'bar',
					'host'        => 'http://kohanaframework.org'
				),
				'http://kohanaframework.org/foo/bar'
			),
			array(
				'foo/bar',
				array(
					'controller'  => 'foo',
					'host'        => 'http://kohanaframework.org'
				),
				'http://kohanaframework.org/foo/bar'
			),
		);
	}

	/**
	 * Tests the external route include route parameters
	 *
	 * @dataProvider provider_external_route_includes_params_in_uri

	public function test_external_route_includes_params_in_uri($route, $defaults, $expected_uri)
	{
		Route::set('test', $route)
			->defaults($defaults);

		$this->assertSame($expected_uri, Route::get('test')->uri());
	}

	/**
	 * Provider for test_route_filter_modify_params
	 *
	 * @return array

	public function provider_route_filter_modify_params()
	{
		return array(
			array(
				'<controller>/<action>',
				array(
					'controller'  => 'Test',
					'action'      => 'same',
				),
				array('Route_Holder', 'route_filter_modify_params_array'),
				'test/different',
				array(
					'controller'  => 'Test',
					'action'      => 'modified',
				),
			),
			array(
				'<controller>/<action>',
				array(
					'controller'  => 'test',
					'action'      => 'same',
				),
				array('Route_Holder', 'route_filter_modify_params_false'),
				'test/fail',
				FALSE,
			),
		);
	}

	/**
	 * Tests that route filters can modify parameters
	 *
	 * @covers Route::filter
	 * @dataProvider provider_route_filter_modify_params

	public function test_route_filter_modify_params($route, $defaults, $filter, $uri, $expected_params)
	{
		$route = new Route($route);

		// Mock a request class
		$request = $this->getMock('Request', array('uri'), array($uri));
		$request->expects($this->any())
			->method('uri')
			->will($this->returnValue($uri));

		$params = $route->defaults($defaults)->filter($filter)->matches($request);

		$this->assertSame($expected_params, $params);
	}

}

###