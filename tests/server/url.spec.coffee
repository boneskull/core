module.exports =
  'url':
    'should be defined and available': ->
      expect(sx.Url).to.be.ok

    'title': ->

      'should convert the text to a slug': ->
        expect(sx.Url.title('THIS TITLE')).to.equal('this-title')
