var Config;

Config = factory('config', require('../lib/system/classes/config.js'));

module.exports = {
  'config': {
    'create a new config that holds stuff': function() {
      var config;
      config = Config('name');
      return expect(config.name).to.equal('name');
    },
    'set using name value': function() {
      var config;
      config = Config('name');
      config.set('new', 'world').set('order', true);
      return expect(config.data).to.eql({
        "new": 'world',
        order: true
      });
    },
    'get using name': function() {
      var config;
      config = Config('name', {
        fusrodah: true
      });
      expect(config.get('fusrodah')).to.be(true);
      return expect(config.get('fusrodan', 'noob')).to.be('noob');
    },
    'append new stuff': function() {
      var config;
      config = Config('name', {
        date: true
      });
      expect(config.data.date).to.equal(true);
      config.set({
        just: 'love'
      });
      expect(config.data).to.eql({
        date: true,
        just: 'love'
      });
      config.set({
        just: 'war'
      });
      return expect(config.data).to.eql({
        date: true,
        just: 'war'
      });
    },
    'clone and leave original data untouched and vice-versa': function() {
      var clone, config;
      config = Config('name', {
        date: '2001-01-01'
      });
      clone = config.clone();
      config.set({
        date: '2012-01-01'
      });
      expect(clone.date).to.equal('2001-01-01');
      clone.date = null;
      return expect(config.data.date).to.equal('2012-01-01');
    },
    'can clone only part of the config data': function() {
      var config, data;
      config = Config('name', {
        some: {
          deep: {
            property: 'ok'
          }
        }
      });
      data = config.clone('some');
      expect(data).to.eql({
        deep: {
          property: 'ok'
        }
      });
      delete data.deep.property;
      return expect(config.data.some.deep.property).to.be('ok');
    },
    'ignore non object on creation': function() {
      var config;
      config = Config('name', 1);
      return expect(config.data).to.eql({});
    },
    'can append another Config instance': function() {
      var config1, config2;
      config1 = Config('config1', {
        hello: 'world'
      });
      config2 = Config('config2', {
        world: 'hello'
      });
      config1.set(config2);
      expect(config1.data).to.eql({
        hello: 'world',
        world: 'hello'
      });
      expect(config2.data).to.eql({
        world: 'hello'
      });
      config1.set({
        "new": 'world'
      });
      config2.set({
        isit: 'world'
      });
      expect(config1.data).to.eql({
        hello: 'world',
        world: 'hello',
        "new": 'world'
      });
      return expect(config2.data).to.eql({
        world: 'hello',
        isit: 'world'
      });
    },
    'delete existing data': function() {
      var config;
      config = Config('existing', {
        existing: 'data'
      });
      config.unset('existing');
      return expect(config.data.existing).to.be.an('undefined');
    },
    'delete existing deep data': function() {
      var config;
      config = Config('existing', {
        existing: {
          deep: 'data',
          untouched: true
        }
      });
      expect(config.get('existing.deep')).to.be('data');
      config.unset('existing.deep');
      expect(config.data.existing.deep).to.be.an('undefined');
      return expect(config.get('existing')).to.eql({
        untouched: true
      });
    },
    'isset should work on false, null and 0 values': function() {
      var config;
      config = Config('null', {
        isnull: null,
        isfalse: false,
        iszero: 0
      });
      expect(config.isset('isnull')).to.be(true);
      expect(config.isset('isfalse')).to.be(true);
      return expect(config.isset('iszero')).to.be(true);
    },
    'wipe clears or exchange all data': function() {
      var config;
      config = Config('yeah', {
        "true": true
      });
      config.wipe({
        "false": false
      });
      expect(config.data).to.eql({
        "false": false
      });
      config.wipe();
      return expect(config.data).to.eql({});
    },
    'get works with arrays or dots': function() {
      var config;
      config = Config('deep', {
        deep: {
          array: {
            like: {
              object: 'true'
            }
          }
        }
      });
      expect(config.get('deep.array.like.object')).to.be('true');
      return expect(config.get(['deep', 'array', 'like', 'object'])).to.be('true');
    },
    'set works with arrays or dots': function() {
      var config;
      config = Config('deep set');
      expect(config.set('deep.array.like.object', 'true').data).to.eql({
        deep: {
          array: {
            like: {
              object: 'true'
            }
          }
        }
      });
      return expect(config.set(['deep', 'array', 'like', 'object'], 'false').data).to.eql({
        deep: {
          array: {
            like: {
              object: 'false'
            }
          }
        }
      });
    },
    'star env': function() {
      var config, data;
      data = {
        '*': {
          'this': {
            'is': 'sparta',
            some: {
              deep: 'property'
            }
          }
        },
        'test': {
          'this': {
            'isnt': 'sparta',
            'is': 'persia',
            'some': {
              'deep': 'item'
            }
          }
        }
      };
      config = Config('env', data);
      expect(config.data).to.eql(data);
      expect(config.env('dont exists').data).to.eql(data);
      expect(config.env('test').data).to.eql({
        'this': {
          'is': 'persia',
          'isnt': 'sparta',
          'some': {
            'deep': 'item'
          }
        }
      });
      return expect(config.envmode).to.be('test');
    }
  }
};
