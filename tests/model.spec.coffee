Model = factory('model', require '../lib/system/classes/model.js')
jdb = require 'jugglingdb'

module.exports = {
  'model':
    'beforeEach': ->
      @User = Model.factory('memory', 'User', ->
        {
          name: String,
          gender: String,
          married: Boolean,
          age: {type: Number, index: true},
          dob: Date,
          extra: @Schema.Text,
          createdAt: {type: Number, default: Date.now}
        })

      @User.model::info = ->
        "#{@name}/#{@gender}/#{@married}"

      @User.model.create({name: 'Shaltay', gender: 'female', married: false, age: 21})
      @User.model.create({name: 'Humpfey', gender: 'male', married: true, age: 25})

    'schema': ->
      expect(jdb.Schema).to.be(@User.$.Schema.Schema)
      expect(jdb.Schema).to.be(@User.Schema)

    'instance': (done) ->
      expect(@User).to.be.ok()
      expect(@User.db).to.be.ok()
      expect(@User.model).to.be.ok()
      expect(@User.model.findOne).to.be.ok()

      @User.model.find(1, (err, user) ->
        user.updateAttributes({married: true})
        done()
      )

    'promises versions are working like the original ones': (done) ->
      User = @User

      User.model.findOne({id: 1}, (err, data) ->
        User.findOne({id: 1}).then((_data)->
          expect(_data).to.eql(data)
          _data
        ).then((found)->
          expect(found.id).to.equal(1)
          User.create(name: 'Testing')
        ).then((created)->
          expect(created.name).to.equal('Testing')
          User.find(2)
        ).then((found)->
          expect(found.id).to.be(2)
          User.count()
        ).then((count)->
          expect(count).to.equal(3)
          User.destroyAll()
        ).then(->
          User.count()
        ).then((count)->
          expect(count).to.equal(0)
          done()
        )
      )

    'invalid relations raise exception': ->
      Test = Model.$define('Test', {
        $relations: {
          belongsTo: ['invalid']
        }
      })

      expect(->
        new Test
      ).to.throwException()

      Test = Model.$define('Test', {
        $relations: {
          hasMany: ['invalid']
        }
      })

      expect(->
        new Test
      ).to.throwException()

      Test = Model.$define('Test', {
        $relations: {
          hasAndBelongsToMany: ['invalid']
        }
      })

      expect(->
        new Test
      ).to.throwException()

    'can define the attrs when defined on itself and have promises and getters/setters': (done) ->
      User = Model.$define('User', {
        $attrs: ->
          {
            name: {type: String, limit: 10}
            gender: String
            married: Boolean
            age: {type: Number, index: true}
            dob: Date
            extra: @Schema.Text
            createdAt: {type: Number, default: Date.now}
          }
      })

      User = new User;
      User.validatesPresenceOf('name')

      user = User.createNew(name: 'Hello', married: true, id: 5)

      user.save()

      user
        .updateAttributes(extra: 'Super text')
        .then(->
          user.updateAttribute('age', 41)
        )
        .then(->
          expect(user.age).to.equal(41)
          user.married = false
          user.dob = Date.now()
        )
        .then(->
          expect(user.model.married).to.be(false)
          expect(user.model.dob).to.not.be.an('undefined')

          User.createNew(married: false, id: 1).save()
        )
        .fail(
          (u) ->
            expect(u.name).to.be('ValidationError')
        )
        .done(->
          done()
        )

    'can use custom functions': (done) ->
      _User = Model.$define('User', {
        $attrs: (deferred) ->
          deferred((model)->
            expect(model::testFunction).to.be.ok()
            done()
          )

          {
            name: String
            active: Boolean
          }

        $functions: {
          testFunction: ->
            @name isnt null
        }
      })

      User = new _User
      user = User.createNew(name: 'asd', active: true)

      expect(user.model.testFunction()).to.equal(true)


    'applies defered actions to the model': (done) ->
      _User = Model.$define('User', {
        $attrs: (deferred) ->

          deferred((model) ->
            model.validatesUniquenessOf('name')

            model::getStatus = ->
              "#{@name} / #{if @active then 'Active' else 'Inactive'}"
          )

          {
            name: String
            active: {type: Boolean, default: false}
          }
      })

      User = new _User
      user = User.createNew(name: 'Name', id: 1)
      User.createNew(name: 'Name', id: 2)

      process.nextTick(->
        expect(user.model.getStatus()).to.equal('Name / Inactive')
        done()
      )

}