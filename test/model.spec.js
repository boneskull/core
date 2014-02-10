var Model, jdb;

Model = factory('model', require('../lib/system/classes/model.js'));

jdb = require('jugglingdb');

module.exports = {
  'model': {
    'beforeEach': function() {
      this.User = Model.factory('memory', 'User', function() {
        return {
          name: String,
          gender: String,
          married: Boolean,
          age: {
            type: Number,
            index: true
          },
          dob: Date,
          extra: this.Schema.Text,
          createdAt: {
            type: Number,
            "default": Date.now
          }
        };
      });
      this.User.create({
        name: 'Shaltay',
        gender: 'female',
        married: false,
        age: 21
      });
      return this.User.create({
        name: 'Humpfey',
        gender: 'male',
        married: true,
        age: 25
      });
    },
    'schema': function() {
      expect(jdb.Schema).to.be(this.User.$.Schema.Schema);
      return expect(jdb.Schema).to.be(this.User.Schema);
    },
    'instance': function(done) {
      expect(this.User).to.be.ok();
      expect(this.User.db).to.be.ok();
      expect(this.User.findOne).to.be.ok();
      return this.User.find(1, function(err, user) {
        user.updateAttributes({
          married: true
        });
        return done();
      });
    },
    'promises versions are working like the original ones': function(done) {
      var User;
      User = this.User;
      return User.findOne({
        id: 1
      }, function(err, data) {
        return User.findOne({
          id: 1
        }).then(function(_data) {
          expect(_data).to.eql(data);
          return _data;
        }).then(function(found) {
          expect(found.id).to.equal(1);
          return User.create({
            name: 'Testing'
          });
        }).then(function(created) {
          expect(created.name).to.equal('Testing');
          return User.find(2);
        }).then(function(found) {
          expect(found.id).to.be(2);
          return User.count();
        }).then(function(count) {
          expect(count).to.equal(3);
          return User.destroyAll();
        }).then(function() {
          return User.count();
        }).then(function(count) {
          expect(count).to.equal(0);
          return done();
        });
      });
    },
    'invalid relations raise exception': function() {
      var Test;
      Test = Model.$define('Test', {
        $relations: {
          belongsTo: ['invalid']
        }
      });
      expect(function() {
        return new Test;
      }).to.throwException();
      Test = Model.$define('Test', {
        $relations: {
          hasMany: ['invalid']
        }
      });
      expect(function() {
        return new Test;
      }).to.throwException();
      Test = Model.$define('Test', {
        $relations: {
          hasAndBelongsToMany: ['invalid']
        }
      });
      return expect(function() {
        return new Test;
      }).to.throwException();
    },
    'can define the attrs when defined on itself and have promises and getters/setters': function(done) {
      var User;
      User = Model.$define('User', {
        $attrs: function() {
          return {
            name: {
              type: String,
              limit: 10
            },
            gender: String,
            married: Boolean,
            age: {
              type: Number,
              index: true
            },
            dob: Date,
            extra: this.Schema.Text,
            createdAt: {
              type: Number,
              "default": Date.now
            }
          };
        }
      });
      User = new User;
      User.validatesPresenceOf('name');
      return User.create({
        name: 'Hello',
        married: true,
        id: 5
      }).done(function(user) {
        return user.updateAttributes({
          extra: 'Super text'
        }).then(function() {
          return user.updateAttribute('age', 41);
        }).then(function() {
          expect(user.age).to.equal(41);
          user.married = false;
          return user.dob = Date.now();
        }).then(function() {
          expect(user.married).to.be(false);
          expect(user.dob).to.not.be.an('undefined');
          return User.create({
            married: false,
            id: 1
          });
        }).then(function(u) {
          return u.save();
        }).fail(function(u) {
          console.log(u);
          return expect(u.name).to.be('ValidationError');
        }).done(function() {
          return done();
        });
      });
    },
    'can use custom functions': function(done) {
      var User, _User;
      _User = Model.$define('User', {
        $attrs: function(deferred) {
          deferred(function(model) {
            expect(model.prototype.testFunction).to.be.ok();
            return done();
          });
          return {
            name: String,
            active: Boolean
          };
        },
        $functions: {
          testFunction: function() {
            return this.name !== null;
          }
        }
      });
      User = new _User;
      return User.create({
        name: 'asd',
        active: true
      }).done(function(user) {
        return expect(user.testFunction()).to.equal(true);
      });
    },
    'works with simplified definition': function(done) {
      var Config, User, _Config, _User;
      _Config = Model.$define('Config', {
        $attrs: {
          alive: Boolean
        }
      });
      Config = new _Config;
      Config.create({
        alive: true
      }).done(function(model) {
        model.save();
        return expect(model.alive).to.be(true);
      });
      _User = Model.$define('User', {
        $attrs: {
          name: String,
          active: Boolean,
          role: Number
        },
        $functions: {
          isActive: function() {
            if (this.role !== 1) {
              return this.active;
            }
            return false;
          }
        },
        $relations: {
          hasMany: [
            'Config', {
              as: 'configs',
              foreignKey: 'configId'
            }
          ]
        },
        findByName: function(name) {
          return this.findOne({
            where: {
              name: name
            }
          });
        }
      });
      User = new _User;
      return User.create({
        name: 'hoho',
        active: true,
        configId: 1,
        role: 2
      }).done(function(user) {
        return user.save().then(function() {
          return User.findByName('hoho');
        }).then(function(model) {
          return expect(model.isActive()).to.be(true);
        }).done(function() {
          return done();
        });
      });
    },
    'applies defered actions to the model': function(done) {
      var User, _User;
      _User = Model.$define('User', {
        $attrs: function(deferred) {
          deferred(function(model) {
            model.validatesUniquenessOf('name');
            return model.prototype.getStatus = function() {
              return "" + this.name + " / " + (this.active ? 'Active' : 'Inactive');
            };
          });
          return {
            name: String,
            active: {
              type: Boolean,
              "default": false
            }
          };
        }
      });
      User = new _User;
      User.create({
        name: 'Name',
        id: 1
      }).done(function(user) {
        expect(user.getStatus()).to.equal('Name / Inactive');
        return done();
      });
      return User.create({
        name: 'Name',
        id: 2
      });
    }
  }
};
