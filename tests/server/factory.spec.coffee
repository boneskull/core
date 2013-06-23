describe 'factory', ->
  
  beforeEach(->
    for k,v of sx.classes 
      delete sx.classes[k] 
  )
  
  it 'should return a class that can be instantiated, that is also available and instantiated in "sx" global', ->
    _Class = sx.factory('Class', {$singleton: true})
    
    expect(sx.Class).to.be.an('object').that.equal(_Class).that.equal(sx.classes.Class)
    
  it 'should modify the classname to be CamelCase', ->
    sx.factory 'class'
    sx.factory 'uCLASS'
    sx.factory 'class-two'
    sx.factory 'class_three'

    expect(sx.classes.Class).to.be.defined
    expect(sx.classes.ClassTwo).to.be.defined
    expect(sx.classes.ClassThree).to.be.defined
    expect(sx.classes.UCLASS).to.be.defined
    
  it 'should create a class if it doesnt exists', ->
    sx.factory 'Class', {
      $singleton: true
      dub: ->
        'success'
    }
    
    expect(sx.classes.Class).to.be.defined
    expect(sx.classes.Class.dub).to.be.defined
    expect(sx.classes.Class.dub).to.be.a.function
    expect(sx.classes.Class.dub()).to.equal('success')
    
  it 'should publish "class.created" topic when a class is created', ->
    spy = sinon.spy()
    
    sub = sx.events.subscribe 'class.created', spy
    
    Cls2 = sx.factory 'Cls2'
    
    expect(sx.classes.Cls).to.be.defined 
    expect(spy.calledWith({class: Cls2, name: 'Cls2'}), sinon.match.any).to.be.true
    
    sub.unsubscribe()
    
  it 'should publish "class.created" when a class is extended', ->
    spy = sinon.spy()
    
    sx.factory 'Cls', {$singleton: true}
    
    sub = sx.events.subscribe 'class.created', spy
    
    sx.factory 'Cls', {
      extended: 1
    } 
     
    expect(sx.Cls).to.be.defined
    expect(sx.Cls.extended).to.equal(1)
    expect(spy.calledWith({class: sx.Cls, name: 'Cls'}), sinon.match.any).to.be.true
    
    sub.unsubscribe()
    
  it 'should extend a class if it exists', ->
    sx.factory 'Class', {
      $singleton: true
      initial: ->
        'initial'
    }
    
    expect(sx.Class).to.be.defined
    expect(sx.Class.initial).to.be.a('function')
    expect(sx.Class.initial()).to.equal('initial')
  
    sx.factory 'Class', {
      forever: ->
        'forever'
    }
    
    expect(sx.Class.forever).to.be.a('function')
    expect(sx.Class.forever()).to.be.equal('forever')
    expect(sx.Class.initial()).to.be.equal('initial')

  it 'should call the original extended function when extending a singleton', ->
    sx.factory 'class', {
      $singleton: true
      base: ->
        'world'
    }
    
    sx.factory 'class', {
      base: ->
        'hello ' + @$super()
    }
    
    expect(sx.Class).to.be.defined
    expect(sx.Class.base()).to.be.equal('hello world')
    
    
  it 'should extend a class if an existing parent is passed', ->
    Class1 = sx.factory 'Class1', {
      $singleton: true
      doit: ->
        'success'
    }  
    
    expect(Class1.doit).to.be.a('function')
    expect(sx.Class1).to.be.equal(Class1)
  
    Class2 = sx.factory 'Class2', {
      $inherits: Class1
      doit2: ->
        'success'
    }

    expect(sx.Class2).to.deep.equal(Class2)
    expect(Class2.doit2).to.be.a('function')
    expect(Class2.doit).to.be.a('function')
    expect(Class2.doit()).to.equal('success')
    expect(Class2.doit2()).to.equal('success')
  
    Class3 = sx.factory 'Class3', {
      $inherits: 'Class2'
      doit3: ->
        'success'
    }
    
    expect(sx.Class3).to.deep.equal(Class3)
    expect(Class3.doit).to.be.a('function')
    expect(Class3.doit2).to.be.a('function')
    expect(Class3.doit2()).to.equal('success')
    expect(Class3.doit3).to.be.a('function')
    expect(Class3.doit3()).to.equal('success')

  it 'should keep it a singleton when extending', ->
    Class1 = sx.factory 'Class', {
      $singleton: true
      func: ->
        'success'
    }
    
    expect(sx.Class.func).to.be.defined
    expect(sx.Class.func).to.be.a.function
    expect(sx.Class).to.be.deep.equal(Class1)
    expect(sx.Class.func()).to.equal('success')
  
    Class2 = sx.factory 'Class', {
      func2: ->
        'success'
    }
  
    expect(sx.Class.func2).to.be.defined
    expect(sx.Class.func2).to.be.a.function
    expect(sx.Class).to.be.deep.equal(Class2)
    expect(sx.Class.func2()).to.equal('success')
    expect(sx.Class.func()).to.equal('success')

  it 'should create a new class name if an existing parent is passed', ->
    Class = sx.factory 'Class', {
      doit: ->
        'success1'    
    }
    
    Cls = sx.factory 'Cls', {
      $inherits: Class
      doit2: ->
        'success2'
    }
    
    cls = sx.classes.Cls.create();
    
    expect(sx.classes.Cls).to.be.deep.equal(Cls)
    expect(cls.doit2).to.be.a('function')
    expect(cls.doit).to.be.a('function')
    expect(Class.create().doit()).to.equal('success1')
    expect(cls.doit2()).to.equal('success2')
    
  it 'should create a class that is extended by an array of classes', ->
    Class1 = sx.factory 'Class1', {
      class1: 1
    }
    
    Class2 = sx.factory 'Class2', {
      class2: 2
    }

    Class3 = sx.factory 'Class3', {
      $inherits: [Class1, Class2]
      construct: ->
        @class2 = 3
        @class1 = 2
    }
    
    class3 = Class3.create()
    expect(class3.$getClass().$className).to.be.equal('Class3')
    expect(class3.class2).to.be.equal(3)
    expect(class3.class1).to.be.equal(2)
    
  it 'should overwrite methods in a order they are written', ->
    Class1 = sx.factory 'Class1', {
      init: 1
    }
    
    Class2 = sx.factory 'Class2', {
      init: 2
      loaded: false
    }

    Class3 = sx.factory 'Class3', {
      $inherits: [Class1, 'Class2'] 
      init: 3
    }
    
    expect(Class1.create().init).to.be.equal(1)
    expect(Class2.create().init).to.be.equal(2)
    expect(Class3.create().init).to.be.equal(3)
    expect(Class3.create().loaded).to.be.equal(false)
    
  it 'should create a class that is extended by an array of classes, ignore invalid classes', ->
    Class1 = sx.factory 'Class1', {
      $singleton: true
      done: ->
        true
    }
      
    Class2 = sx.factory 'Class2'

    Class3 = sx.factory 'Class3', {
      $inherits: [Class1, Class2, 'Class4'], 
      doit: ->
        'success'
    }
    
    expect(sx.Class3.doit).to.be.a('function')
    expect(sx.Class3.done).to.be.a('function')
    expect(sx.Class3.doit()).to.equal('success')
    
  it 'should create a new class even if an invalid parent is passed', ->
    sx.factory 'Cls', {
      $inherits: 'Clsss'
      init: ->
        'success'
    }
    
    expect(sx.classes.Cls).to.be.defined
    expect(sx.classes.Cls.create().init).to.be.a('function')
    expect(sx.classes.Cls.create().init()).to.equal('success')
  
  return
