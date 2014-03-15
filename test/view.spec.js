var Request, View;

View = factory('view', require('../lib/system/classes/view'));

Request = factory('request', require('../lib/system/classes/request'));

module.exports = {

  'view': {

    'get the view from the request': function (){
      var req;
      req = {
        path: '/'
      };
      req = Request.factory(req);

      View.factory(req);
    },

    'get engine by extension': function (done){
      var test, view;

      test = function (){
        expect(view.name).to.be('test.ejs');

        view.render({
          title   : 'Cleaning Supplies',
          supplies: ['mop', 'broom', 'duster']
        }).then(function (html){
          expect(html).to.equal('<h1>Cleaning Supplies</h1>\n<ul>\n\n\t<li>mop</li>\n\n\t<li>broom</li>\n\n\t<li>duster</li>\n\n</ul>');
        }).done(done);
      };

      view = new View(fixtures.get(['view','test.ejs']), {
        base : fixtures.join(['view']),
        ready: test
      });
    },

    'work with subfolders': function (done){
      var jade, test;

      test = function (){
        expect(jade.name).to.be('subfolder/test.jade');

        jade.render({
          title   : 'Cleaning Supplies',
          supplies: ['mop', 'broom', 'duster']
        }).then(function (html){
          expect(html).to.equal('<h1>Cleaning Supplies<ul><li>mop</li><li>broom</li><li>duster</li></ul></h1>');
        }).done(done);
      };

      jade = new View(fixtures.get(['view','subfolder','test.jade']), {
        base : fixtures.join(['view']),
        ready: test
      });
    },

    'work with different path.sep': function (done){
      var dust, test;

      test = function (){
        expect(dust.name).to.be('subfolder/levels/deep.dust');

        dust.render({
          one: 0
        }).then(function (html){
          expect(html).to.equal('0');
        }).done(done);
      };

      dust = new View(fixtures.get(['view','subfolder','levels','deep.dust']), {
        base : fixtures.join(['view']),
        ready: test
      });
    },

    'ignore extension using "type"': function (done){
      var go2, swig, test;

      test = function (){
        expect(swig.name).to.be('test.mustache.html');
        swig.render({
          title   : 'Cleaning Supplies',
          supplies: ['mop', 'broom', 'duster']
        }).then(function (html){
          expect(html).to.equal('<h1>Cleaning Supplies</h1><ul><li>mop</li><li>broom</li><li>duster</li></ul>');
        }).done(go2);
      };

      swig = new View(fixtures.get(['view','test.mustache.html']), {
        base  : fixtures.join(['view']),
        'type': 'swig',
        ready : test
      });

      go2 = function (){
        var handlebars, test2;

        test2 = function (){
          expect(handlebars.name).to.be('subfolder/levels/deep');

          handlebars.render({
            title: 'hi'
          }).done(function (html){
            expect(html).to.equal('<p>hi</p>');
            done();
          });
        };

        handlebars = new View(fixtures.get(['view','subfolder','levels','deep']), {
          base  : fixtures.join(['view']),
          'type': 'handlebars',
          ready : test2
        });
      };
    }
  }
};
