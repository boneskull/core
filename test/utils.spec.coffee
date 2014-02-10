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

    'wrapConditionalPromise': (done) ->
      obj = {
        testing: (callback) ->
          callback(null, 'ok')
        testing2: (value, callback) ->
          callback(null, value)
        testing3: (value, value2, callback) ->
          callback(null, {value:value, value2:value2})
        testing4: (callback) ->
          callback('fail')
        testing5: ->
          true
      }
      Utils.wrapConditionalPromise(obj, 'testing')
      Utils.wrapConditionalPromise(obj, 'testing2')
      Utils.wrapConditionalPromise(obj, 'testing3')
      Utils.wrapConditionalPromise(obj, 'testing4')
      Utils.wrapConditionalPromise(obj, 'testing5', true)

      obj.testing(->
        expect(arguments).to.eql({0: null, 1: 'ok'})

        obj.testing().then((res)->
          expect(res).to.be('ok')
        ).done(->
          obj.testing2('value', (err, result)->
            expect(err).to.be(null)
            expect(result).to.be('value')
            obj.testing2('value').then((value)->
              expect(value).to.be('value')
            ).done(->
              obj.testing3('1','2', (err,result)->
                expect(err).to.be(null)
                expect(result).to.eql({value:'1',value2:'2'})
                obj.testing3('1','2').then((res)->
                  expect(res).to.eql({value:'1',value2:'2'})
                ).done(->
                  obj.testing4((err, result)->
                    expect(err).to.be('fail')
                    obj.testing4().fail((err)->
                      expect(err).to.be('fail')
                    ).done(->
                      obj.testing5().done((value)->
                        expect(value).to.be(true)
                        done()
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )

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