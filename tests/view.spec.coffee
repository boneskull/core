View = factory('view', require '../lib/system/classes/view')
Request = factory('request', require '../lib/system/classes/request')

module.exports = {
  'view': {
    'get the view from the request': ->
      req = {path: '/'}
      req = Request.factory(req)

      View.factory(req)

    'get engine by extension': (done) ->
      test = ->
        expect(view.name).to.be('test.ejs')

        view
        .render({
          title   : 'Cleaning Supplies',
          supplies: ['mop', 'broom', 'duster']
        })
        .then(
          (html)->
            expect(html).to.equal('<h1>Cleaning Supplies</h1>\n<ul>\n\n\t<li>mop</li>\n\n\t<li>broom</li>\n\n\t<li>duster</li>\n\n</ul>')
            done()
        ).done()

      view = new View(__dirname + '/fixtures/view/test.ejs', {base: 'fixtures/view', ready: test})


    'work with subfolders': (done) ->
      test = ->
        expect(jade.name).to.be('subfolder/test.jade')

        jade
        .render({
          title   : 'Cleaning Supplies',
          supplies: ['mop', 'broom', 'duster']
        })
        .then(
          (html)->
            expect(html).to.equal('<h1>Cleaning Supplies<ul><li>mop</li><li>broom</li><li>duster</li></ul></h1>')
            done()
        ).done()

      jade = new View(__dirname + '/fixtures/view/subfolder/test.jade', {base: '/fixtures/view/', ready: test})

    'ignore extension using "type"': (done) ->
      test = ->
        expect(swig.name).to.be('test.mustache.html')

        swig
        .render({
          title   : 'Cleaning Supplies',
          supplies: ['mop', 'broom', 'duster']
        })
        .then(
          (html)->
            expect(html).to.equal('<h1>Cleaning Supplies</h1><ul><li>mop</li><li>broom</li><li>duster</li></ul>')
        )
        .done()

      swig = new View(__dirname + '/fixtures/view/test.mustache.html', {base: '/fixtures/view/', 'type': 'swig', ready: test})

      test2 = ->
        expect(handlebars.name).to.be('subfolder/levels/deep')

        handlebars
        .render({
          title: 'hi'
        })
        .done((html)->
          expect(html).to.equal('<p>hi</p>')
          done()
        )

      handlebars = new View(__dirname + '/fixtures/view/subfolder/levels/deep', {base: '/fixtures/view/', 'type': 'handlebars', ready: test2})
  }
}