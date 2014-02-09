Form = factory('form', require '../lib/system/classes/form.js')
Request = factory('request', require '../lib/system/classes/request.js')

express = require('express')
supertest = require('supertest')

module.exports = {
  'form':
    'parse': (done) ->
      fail = sinon.spy()
      app = express()

      app.post('/', (req,res) ->
        req = Request.factory(req)
        Form.parse(req).then(
          (data)->
            expect(fail.called).to.be(false)
            expect(data).to.eql(parse: 'done', user: name: 'ok')
            done()

          fail
        )
        res.status(200)
      )

      supertest(app).post('/').send('parse': 'done', user: name: 'ok').expect(200).end(-> )

    'beforeEach': ->

      forms = Form.get()

      @form = forms.create(
        username: forms.fields.string(required: true)
        password: forms.fields.password(required: true)
        confirm : forms.fields.password(
          required  : true
          validators: [forms.validators.matchField('password')]
        )
        personal:
          name   : forms.fields.string(required: true, label: 'Name')
          email  : forms.fields.email(required: true, label: 'Email')
          address:
            address1: forms.fields.string(required: true, label: 'Address 1')
            address2: forms.fields.string(label: 'Address 2')
            city    : forms.fields.string(required: true, label: 'City')
            state   : forms.fields.string(required: true, label: 'State')
            zip     : forms.fields.number(required: true, label: 'ZIP')
      )

    'get': ->
      expect(@form.fields).to.have.property('username')
      expect(@form.fields).to.have.property('password')
      expect(@form.fields).to.have.property('confirm')
      expect(@form.fields).to.have.property('personal')

    'validate': (done) ->
      form = @form
      fail = sinon.spy()

      app = express()
      app.use(express.urlencoded())
      app.use(express.json())

      app.post('/', (req,res) ->
        _req = Request.factory(req)

        Form.validate(_req , form).then(
          ->
            expect(fail.called).to.be(false)
            done()

          fail
        ).done(-> res.status(200))
      )

      formdata = {
        username: 'username'
        password: 'password'
        confirm: 'password'
        personal:
          name: 'name'
          email: 'email@email.com'
          address:
            address1: 'address1'
            city: 'city'
            state: 'state'
            zip: '11111'
      }

      supertest(app).post('/').send(formdata).expect(200).end(-> )


}