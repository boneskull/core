repo = {}

factory = require('../lib/system/core/factory.js')(repo)

module.exports =
  'factory':

    beforeEach: ->
      for k,v of repo
        delete repo[k]

    'should return a class that can be instantiated, that is also available and instantiated in "sx" global': ->
      _Class = factory('Class', {$singleton: true})

      expect(repo.Class).to.equal(_Class)

    'should modify the classname to be CamelCase': ->
      factory 'class'
      factory 'uCLASS'
      factory 'class-two'
      factory 'class_three'

      expect(repo.Class).to.be.ok()
      expect(repo.Uclass).to.be.ok()
      expect(repo.ClassTwo).to.be.ok()
      expect(repo.ClassThree).to.be.ok()

    'should create a class if it doesnt exists': ->
      factory 'Class', {
        $singleton: true
        dub: ->
          'success'
      }

      expect(repo.Class).to.be.ok()
      expect(repo.Class.dub).to.be.ok()
      expect(repo.Class.dub).to.be.a('function')
      expect(repo.Class.dub()).to.equal('success')
    ###
    'should publish "class.created" topic when a class is created': ->
      spy = sinon.spy()

      sub = sx.events.subscribe 'class.created', spy

      Cls2 = factory 'Cls2'

      expect(repo.Cls2).to.be.ok()
      expect(spy.calledWith({class: Cls2, name: 'Cls2'}), sinon.match.any).to.equal(true)

      sub.unsubscribe()

    'should publish "class.created" when a class is extended': ->
      spy = sinon.spy()

      factory 'Cls', {$singleton: true}

      sub = sx.events.subscribe 'class.created', spy

      factory 'Cls', {
        extended: 1
      }

      expect(repo.Cls).to.be.ok()
      expect(repo.Cls.extended).to.equal(1)
      expect(spy.calledWith({class: repo.Cls, name: 'Cls'}), sinon.match.any).to.be.true

      sub.unsubscribe()

    'should extend a class if it exists': ->
      factory 'Class', {
        $singleton: true
        initial: ->
          'initial'
      }

      expect(sx.Class).to.be.ok()
      expect(sx.Class.initial).to.be.a('function')
      expect(sx.Class.initial()).to.equal('initial')

      factory 'Class', {
        forever: ->
          'forever'
      }

      expect(sx.Class.forever).to.be.a('function')
      expect(sx.Class.forever()).to.equal('forever')
      expect(sx.Class.initial()).to.equal('initial')

    'should call the original extended function when extending a singleton': ->
      factory 'class', {
        $singleton: true
        base: ->
          'world'
      }

      factory 'class', {
        base: ->
          'hello ' + @$super()
      }

      expect(sx.Class).to.be.ok()
      expect(sx.Class.base()).to.equal('hello world')


    'should extend a class if an existing parent is passed': ->
      Class1 = factory 'Class1', {
        $singleton: true
        doit: ->
          'success'
      }

      expect(Class1.doit).to.be.a('function')
      expect(sx.Class1).to.be(Class1)

      Class2 = factory 'Class2', {
        $extend: Class1
        doit2: ->
          'success'
      }

      expect(sx.Class2).to.eql(Class2)
      expect(Class2.doit2).to.be.a('function')
      expect(Class2.doit).to.be.a('function')
      expect(Class2.doit()).to.equal('success')
      expect(Class2.doit2()).to.equal('success')

      Class3 = factory 'Class3', {
        $extend: 'Class2'
        doit3: ->
          'success'
      }

      expect(sx.Class3).to.eql(Class3)
      expect(Class3.doit).to.be.a('function')
      expect(Class3.doit2).to.be.a('function')
      expect(Class3.doit2()).to.equal('success')
      expect(Class3.doit3).to.be.a('function')
      expect(Class3.doit3()).to.equal('success')

    'should keep it a singleton when extending': ->
      Class1 = factory 'Class', {
        $singleton: true
        func: ->
          'success'
      }

      expect(sx.Class.func).to.be.ok()
      expect(sx.Class.func).to.be.a('function')
      expect(sx.Class).to.be(Class1)
      expect(sx.Class.func()).to.equal('success')

      Class2 = factory 'Class', {
        func2: ->
          'success'
      }

      expect(sx.Class.func2).to.be.ok()
      expect(sx.Class.func2).to.be.a('function')
      expect(sx.Class).to.be(Class2)
      expect(sx.Class.func2()).to.equal('success')
      expect(sx.Class.func()).to.equal('success')
    ###

    'should create a new class name if an existing parent is passed': ->
      Class = factory 'Class', {
        doit: ->
          'success1'
      }

      Cls = factory 'Cls', {
        $extend: Class
        doit2: ->
          'success2'
      }

      cls = repo.Cls.create();

      expect(repo.Cls).to.eql(Cls)
      expect(cls.doit2).to.be.a('function')
      expect(cls.doit).to.be.a('function')
      expect(Class.create().doit()).to.equal('success1')
      expect(cls.doit2()).to.equal('success2')

    'should create a class that is extended by an array of classes': ->
      Class1 = factory 'Class1', {
        class1: 1
      }

      Class2 = factory 'Class2', {
        class2: 2
      }

      Class3 = factory 'Class3', {
        $extend: [Class1, Class2]
        construct: ->
          @class2 = 3
          @class1 = 2
      }

      class3 = Class3.create()
      expect(class3.$class.$className).to.equal('Class3')
      expect(class3.class2).to.equal(3)
      expect(class3.class1).to.equal(2)
      expect(class3.$implements).to.eql([Class1, Class2])

    'should overwrite methods in a order they are written': ->
      Class1 = factory 'Class1', {
        init: 1
      }

      Class2 = factory 'Class2', {
        init: 2
        loaded: false
      }

      Class3 = factory 'Class3', {
        $extend: [Class1, 'Class2']
        init: 3
      }

      expect(Class1.create().init).to.equal(1)
      expect(Class2.create().init).to.equal(2)
      expect(Class3.create().init).to.equal(3)
      expect(Class3.create().loaded).to.equal(false)

    ###
    'should create a class that is extended by an array of classes, ignore invalid classes': ->
      Class1 = factory 'Class1', {
        $singleton: true
        done: ->
          true
      }

      Class2 = factory 'Class2'

      Class3 = factory 'Class3', {
        $extend: [Class1, Class2, 'Class4'],
        doit: ->
          'success'
      }

      expect(sx.Class3.doit).to.be.a('function')
      expect(sx.Class3.done).to.be.a('function')
      expect(sx.Class3.doit()).to.equal('success')
    ###

    'should deal with functions passed without problems': ->

      factory('Clss', ->
        up = 0
        {
          parlay: ->
            'success'
          up: ->
            ++up
        }
      )

      expect(repo.Clss).to.be.ok()
      expect(repo.Clss.create().parlay()).to.equal('success')
      expect(repo.Clss.create().up()).to.equal(1)
      expect(repo.Clss.create().up()).to.equal(2)

      factory('Clss', ->
        {
          $static: {
            yuck: 'nah'
          }
          devious: =>
            @yuck
        }
      )

      expect(repo.Clss.yuck).to.equal('nah')
      expect(repo.Clss.create().devious()).to.equal('nah')
      expect(repo.Clss.create().up()).to.equal(3)

    'should be able to extend a class directly': ->
      factory 'Clss', {
        $static: {
          instances: [1,2,3]
          variables: {'loaded': true}
        }
      }

      repo.Clss.implement({
        dull: true
      })

      expect(repo.Clss.instances).to.eql([1,2,3])
      expect(repo.Clss.variables).to.eql({'loaded': true})
      expect(repo.Clss.dull).to.equal(true)
      expect(repo.Clss.create().go).to.be.an('undefined')

      repo.Clss.dull = false
      repo.Clss.include({
        go: ->
          'success'
      })

      expect(repo.Clss.dull).to.equal(false)
      expect(repo.Clss.create().go()).to.equal('success')

    'should create a new class even if an invalid parent is passed': ->
      factory 'Cls', {
        $extend: 'Clsss'
        init: ->
          'success'
      }

      expect(repo.Cls).to.be.ok()
      expect(repo.Cls.create().init).to.be.a('function')
      expect(repo.Cls.create().init()).to.equal('success')

    'should mixin without changing both classes': ->
      factory 'Cls', {
        $static: {
          init: ->
            'success'
        }
      }

      expect(repo.Cls).to.be.ok()
      expect(repo.Cls.init()).to.equal('success')

      factory 'Clss', {
        $extend: 'Cls',
        $static: {
          'yes': true
        }
      }

      expect(repo.Clss).to.be.ok()
      expect(repo.Clss.yes).to.equal(true)
      expect(repo.Clss.init()).to.equal('success')

      factory 'Cls', {
        $static: {
          'another': 'static'
        }
      }

      expect(repo.Cls.another).to.equal('static')
      expect(repo.Clss.$implements[0].another).to.equal('static')
      expect(repo.Clss.$implements[0]).to.eql(repo.Cls)
