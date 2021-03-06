
var factory, repo, _factory;

repo = {};

_factory = require('../lib/system/core/factory.js');

factory = _factory(repo);

module.exports = {
  'factory': {
    beforeEach: function() {
      var k, v, _results;
      _results = [];
      for (k in repo) {
        v = repo[k];
        _results.push(delete repo[k]);
      }
      return _results;
    },
    'throws an error if declaration isnt an object': function() {
      return expect(function() {
        return factory('Classy', 'not an object');
      }).to.throwError();
    },
    'returns the class': function() {
      var _Class;
      _Class = factory('Class', {
        $singleton: true
      });
      return expect(repo.Class).to.equal(_Class);
    },
    'weird names with numbers': function() {
      factory('9_true');
      factory('howabout8');
      factory('7class');
      factory('class_5');
      expect(repo['9True']).to.be.ok();
      expect(repo.Howabout8).to.be.ok();
      expect(repo['7class']).to.be.ok();
      return expect(repo['Class5']).to.be.ok();
    },
    'modifies the classname to be CamelCase': function() {
      factory('class');
      factory('uCLASS');
      factory('class-two');
      factory('class_three');
      expect(repo.Class).to.be.ok();
      expect(repo.Uclass).to.be.ok();
      expect(repo.ClassTwo).to.be.ok();
      return expect(repo.ClassThree).to.be.ok();
    },
    'creates a class if it doesnt exists': function() {
      factory('Class', {
        $singleton: true,
        dub: function() {
          return 'success';
        }
      });
      expect(repo.Class).to.be.ok();
      expect(repo.Class.dub).to.be.ok();
      expect(repo.Class.dub).to.be.a('function');
      return expect(repo.Class.dub()).to.equal('success');
    },
    'extends a class if it exists': function() {
      factory('Class', {
        $singleton: true,
        initial: function() {
          return 'initial';
        }
      });
      expect(repo.Class).to.be.ok();
      expect(repo.Class.initial).to.be.a('function');
      expect(repo.Class.initial()).to.equal('initial');
      factory('Class', {
        forever: function() {
          return 'forever';
        }
      });
      expect(repo.Class.forever).to.be.a('function');
      expect(repo.Class.forever()).to.equal('forever');
      return expect(repo.Class.initial()).to.equal('initial');
    },
    'calls the original extended function when extending a singleton': function() {
      factory('class', {
        $singleton: true,
        base: function() {
          return 'world';
        }
      });
      factory('class', {
        base: function() {
          return 'hello ' + this.$super();
        }
      });
      expect(repo.Class).to.be.ok();
      return expect(repo.Class.base()).to.equal('hello world');
    },
    'extends a class if an existing parent is passed': function() {
      var Class1, Class2, Class3;
      Class1 = factory('Class1', {
        $singleton: true,
        doit: function() {
          return 'success';
        }
      });
      expect(Class1.doit).to.be.a('function');
      expect(repo.Class1).to.be(Class1);
      Class2 = factory('Class2', {
        $implement: Class1,
        doit2: function() {
          return 'success';
        }
      });
      expect(repo.Class2).to.eql(Class2);
      expect(Class2.doit2).to.be.a('function');
      expect(Class2.doit).to.be.a('function');
      expect(Class2.doit()).to.equal('success');
      expect(Class2.doit2()).to.equal('success');
      Class3 = factory('Class3', {
        $implement: 'Class2',
        doit3: function() {
          return 'success';
        }
      });
      expect(repo.Class3).to.eql(Class3);
      expect(Class3.doit).to.be.a('function');
      expect(Class3.doit2).to.be.a('function');
      expect(Class3.doit2()).to.equal('success');
      expect(Class3.doit3).to.be.a('function');
      return expect(Class3.doit3()).to.equal('success');
    },
    'keeps it a singleton when extending': function() {
      var Class1, Class2;
      Class1 = factory('Class', {
        $singleton: true,
        func: function() {
          return 'success';
        }
      });
      expect(repo.Class.func).to.be.ok();
      expect(repo.Class.func).to.be.a('function');
      expect(repo.Class).to.be(Class1);
      expect(repo.Class.func()).to.equal('success');
      Class2 = factory('Class', {
        func2: function() {
          return 'success';
        }
      });
      expect(repo.Class.func2).to.be.ok();
      expect(repo.Class.func2).to.be.a('function');
      expect(repo.Class).to.be(Class2);
      expect(repo.Class.func2()).to.equal('success');
      return expect(repo.Class.func()).to.equal('success');
    },
    'creates a new class name if an existing parent is passed': function() {
      var Class, Cls, cls;
      Class = factory('Class', {
        doit: function() {
          return 'success1';
        }
      });
      Cls = factory('Cls', {
        $implement: Class,
        doit2: function() {
          return 'success2';
        }
      });
      cls = repo.Cls.create();
      expect(repo.Cls).to.eql(Cls);
      expect(cls.doit2).to.be.a('function');
      expect(cls.doit).to.be.a('function');
      expect(Class.create().doit()).to.equal('success1');
      return expect(cls.doit2()).to.equal('success2');
    },
    'creates a class that is extended by an array of classes': function() {
      var Class1, Class2, Class3, class3;
      Class1 = factory('Class1', {
        class1: 1
      });
      Class2 = factory('Class2', {
        class2: 2
      });
      Class3 = factory('Class3', {
        $implement: [Class1, Class2],
        construct: function() {
          this.class2 = 3;
          return this.class1 = 2;
        }
      });
      class3 = Class3.create();
      expect(class3.$class.$className).to.equal('Class3');
      expect(class3.class2).to.equal(3);
      expect(class3.class1).to.equal(2);
      return expect(class3.$implements).to.eql([Class1, Class2]);
    },
    'overwrites methods in a order they are written': function() {
      var Class1, Class2, Class3;
      Class1 = factory('Class1', {
        init: 1
      });
      Class2 = factory('Class2', {
        init: 2,
        loaded: false
      });
      Class3 = factory('Class3', {
        $implement: [Class1, 'Class2'],
        init: 3
      });
      expect(Class1.create().init).to.equal(1);
      expect(Class2.create().init).to.equal(2);
      expect(Class3.create().init).to.equal(3);
      return expect(Class3.create().loaded).to.equal(false);
    },
    'creates a class that is extended by an array of classes, ignore invalid classes': function() {
      var Class1, Class2, Class3;
      Class1 = factory('Class1', {
        $singleton: true,
        done: function() {
          return true;
        }
      });
      Class2 = factory('Class2');
      Class3 = factory('Class3', {
        $implement: [Class1, Class2, 'Class4'],
        doit: function() {
          return 'success';
        }
      });
      expect(repo.Class3.doit).to.be.a('function');
      expect(repo.Class3.done).to.be.a('function');
      return expect(repo.Class3.doit()).to.equal('success');
    },
    'deals with functions passed without problems': function() {
      factory('Clss', function() {
        var up;
        up = 0;
        return {
          parlay: function() {
            return 'success';
          },
          up: function() {
            return ++up;
          }
        };
      });
      expect(repo.Clss).to.be.ok();
      expect(repo.Clss.create().parlay()).to.equal('success');
      expect(repo.Clss.create().up()).to.equal(1);
      expect(repo.Clss.create().up()).to.equal(2);
      factory('Clss', function() {
        return {
          $static: {
            yuck: 'nah'
          },
          devious: (function(_this) {
            return function() {
              return _this.yuck;
            };
          })(this)
        };
      });
      expect(repo.Clss.yuck).to.equal('nah');
      expect(repo.Clss.create().devious()).to.equal('nah');
      return expect(repo.Clss.create().up()).to.equal(3);
    },
    'be able to extend a class directly': function() {
      factory('Clss', {
        $static: {
          instances: [1, 2, 3],
          variables: {
            'loaded': true
          }
        }
      });
      repo.Clss.implement({
        dull: true
      });
      expect(repo.Clss.instances).to.eql([1, 2, 3]);
      expect(repo.Clss.variables).to.eql({
        'loaded': true
      });
      expect(repo.Clss.dull).to.equal(true);
      expect(repo.Clss.create().go).to.be.an('undefined');
      repo.Clss.dull = false;
      repo.Clss.include({
        go: function() {
          return 'success';
        }
      });
      expect(repo.Clss.dull).to.equal(false);
      return expect(repo.Clss.create().go()).to.equal('success');
    },
    'creates a new class even if an invalid parent is passed': function() {
      factory('Cls', {
        $implement: 'Clsss',
        init: function() {
          return 'success';
        }
      });
      expect(repo.Cls).to.be.ok();
      expect(repo.Cls.create().init).to.be.a('function');
      return expect(repo.Cls.create().init()).to.equal('success');
    },
    'mixin without changing both classes': function() {
      factory('Cls', {
        $static: {
          init: function() {
            return 'success';
          }
        }
      });
      expect(repo.Cls).to.be.ok();
      expect(repo.Cls.init()).to.equal('success');
      factory('Clss', {
        $implement: 'Cls',
        $static: {
          'yes': true
        }
      });
      expect(repo.Clss).to.be.ok();
      expect(repo.Clss.yes).to.equal(true);
      expect(repo.Clss.init()).to.equal('success');
      factory('Cls', {
        $static: {
          'another': 'static'
        }
      });
      expect(repo.Cls.another).to.equal('static');
      expect(repo.Clss.$implements[0].another).to.equal('static');
      return expect(repo.Clss.$implements[0]).to.eql(repo.Cls);
    },
    'callback is called when creating a class': function() {
      var Clss, factor, spy, _repo;
      spy = sinon.spy();
      _repo = {};
      factor = _factory(_repo, spy);
      Clss = factor('Class', {});
      expect(spy.callCount).to.be(1);
      return expect(spy.args[0][0]).to.eql({
        name: 'Class',
        'class': Clss
      });
    },
    'extend should work as prototypal inheritance': function() {
      var Cls, Clss, Clsss;
      Clss = factory('Clss', {
        init: function(bleh) {
          return bleh;
        }
      });
      expect(Clss().init('bleh')).to.be('bleh');
      Clsss = factory('Clsss', {
        $extend: Clss
      });
      Clss.include({
        init: function() {
          return 'no';
        }
      });
      expect(Clsss().init('bleh')).to.be('no');
      Cls = factory('Cls', {
        $extend: 'Clsss',
        init: function(yeah) {
          return this.$super(yeah);
        }
      });
      return expect(Cls().init('yes')).to.be('no');
    }
  }
};
