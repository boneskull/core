Utils = factory('utils', require '../lib/system/classes/utils.js')

module.exports = {
  'utils':
    'sprintf': ->
      expect(Utils.sprintf).to.be.ok()
      expect(Utils.vsprintf).to.be.ok()

      expect(Utils.sprintf('Hello %s', 'Juarez')).to.equal('Hello Juarez')
      expect(Utils.vsprintf('Hello %s', ['Juarez'])).to.equal('Hello Juarez')

    'strReplace': ->
      str = Utils.strReplace
      expect(str).to.be.ok()
      expect(str('a', 'b', 'aabbcc')).to.equal('bbbbcc')

    'promesifyAll': () ->
      source = {
        one: (val, cb) ->
          if not val
            return cb('error')

          cb(null, val)

        two: (val, val2, cb) ->
          if not val or not val2
            return cb('error')

          @one(val + val2, cb)
      }

      source.two('a', 'b', (err, val) ->
        expect(val).to.equal('ab')
      )

      dest = {}
      Utils.promesifyAll(source, dest);

      expect(dest.two).to.be.ok()
      expect(dest.one).to.be.ok()

      dest.one('value').then((value)->
        expect(value).to.be('value')
      )

      dest.two('1','2').then((value)->
        expect(value).to.equal('12')
      )

      dest.two().fail((err)->
        expect(err).to.be('error')
      )

      dest = {}

      Utils.promesifyAll(source, dest, ['one']);

      expect(dest.two).to.not.be.ok()
      expect(dest.one).to.be.ok()


}