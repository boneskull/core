url = factory('url', require '../lib/system/classes/url.js')

module.exports =
  'url':
    'should be defined and available': ->
      expect(url).to.be.ok()

    'title': ->

      'should convert the text to a slug': ->
        expect(url.title('THIS TITLE')).to.equal('this-title')
