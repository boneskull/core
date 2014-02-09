var Form, Request, express, supertest;

Form = factory('form', require('../lib/system/classes/form.js'));

Request = factory('request', require('../lib/system/classes/request.js'));

express = require('express');

supertest = require('supertest');

module.exports = {
  'form': {
    'parse': function(done) {
      var app, fail;
      fail = sinon.spy();
      app = express();
      app.post('/', function(req, res) {
        req = Request.factory(req);
        Form.parse(req).then(function(data) {
          expect(fail.called).to.be(false);
          expect(data).to.eql({
            parse: 'done',
            user: {
              name: 'ok'
            }
          });
          return done();
        }, fail);
        return res.status(200);
      });
      return supertest(app).post('/').send({
        'parse': 'done',
        user: {
          name: 'ok'
        }
      }).expect(200).end(function() {});
    },
    'beforeEach': function() {
      var forms;
      forms = Form.get();
      return this.form = forms.create({
        username: forms.fields.string({
          required: true
        }),
        password: forms.fields.password({
          required: true
        }),
        confirm: forms.fields.password({
          required: true,
          validators: [forms.validators.matchField('password')]
        }),
        personal: {
          name: forms.fields.string({
            required: true,
            label: 'Name'
          }),
          email: forms.fields.email({
            required: true,
            label: 'Email'
          }),
          address: {
            address1: forms.fields.string({
              required: true,
              label: 'Address 1'
            }),
            address2: forms.fields.string({
              label: 'Address 2'
            }),
            city: forms.fields.string({
              required: true,
              label: 'City'
            }),
            state: forms.fields.string({
              required: true,
              label: 'State'
            }),
            zip: forms.fields.number({
              required: true,
              label: 'ZIP'
            })
          }
        }
      });
    },
    'get': function() {
      expect(this.form.fields).to.have.property('username');
      expect(this.form.fields).to.have.property('password');
      expect(this.form.fields).to.have.property('confirm');
      return expect(this.form.fields).to.have.property('personal');
    },
    'validate': function(done) {
      var app, fail, form, formdata;
      form = this.form;
      fail = sinon.spy();
      app = express();
      app.use(express.urlencoded());
      app.use(express.json());
      app.post('/', function(req, res) {
        var _req;
        _req = Request.factory(req);
        return Form.validate(_req, form).then(function() {
          expect(fail.called).to.be(false);
          return done();
        }, fail).done(function() {
          return res.status(200);
        });
      });
      formdata = {
        username: 'username',
        password: 'password',
        confirm: 'password',
        personal: {
          name: 'name',
          email: 'email@email.com',
          address: {
            address1: 'address1',
            city: 'city',
            state: 'state',
            zip: '11111'
          }
        }
      };
      return supertest(app).post('/').send(formdata).expect(200).end(function() {});
    }
  }
};
